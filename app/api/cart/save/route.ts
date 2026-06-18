import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";

const cartItemSchema = z.object({
  productId: z.string().max(36),
  variantSku: z.string().max(60),
  quantity: z.number().int().min(1).max(99),
});

const cartDataSchema = z.array(cartItemSchema).max(50);

// S-18: Validate sessionId format — must be a UUID (36-char hex/dash string) to prevent
// attackers from supplying arbitrary strings to overwrite other sessions. Client-side
// code must generate sessionIds via crypto.randomUUID().
const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// S-18: Validate email with Zod to prevent seeding arbitrary emails for cron abuse.
const emailSchema = z.string().email().max(254);

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!(await rateLimit(`cart-save:${ip}`, 20, 60_000))) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please slow down." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { sessionId, email, cartData } = body;

    // S-18: Reject sessionIds that don't match the UUID format, bounding both length
    // and charset so a client cannot supply arbitrary strings as session keys.
    if (!sessionId || typeof sessionId !== "string" || !SESSION_ID_RE.test(sessionId)) {
      return NextResponse.json({ ok: false, error: "Invalid sessionId." }, { status: 400 });
    }

    // S-18: Validate email with Zod to prevent seeding untrusted emails into the
    // abandoned-cart table (the cron job later sends recovery emails to that address).
    let validatedEmail = "";
    if (email !== undefined && email !== null && email !== "") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
      }
      validatedEmail = emailResult.data;
    }

    const cartDataResult = cartDataSchema.safeParse(cartData);
    if (!cartDataResult.success) {
      return NextResponse.json({ ok: false, error: "Invalid cartData." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("abandoned_carts")
      .upsert(
        {
          session_id: sessionId,
          email: validatedEmail,
          cart_data: cartDataResult.data,
          updated_at: new Date().toISOString(),
          email_sent_at: null,
        },
        { onConflict: "session_id" }
      );

    if (error) {
      return NextResponse.json({ ok: false, error: "Failed to save cart." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
