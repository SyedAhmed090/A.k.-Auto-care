import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkCsrf } from "@/lib/csrf";
import { requireAdmin, requireRole } from "@/lib/adminAuth";

const createSchema = z.object({
  code:      z.string().min(2).max(30).transform(s => s.toUpperCase()),
  discount:  z.number().min(0.01).max(1),
  minSpend:  z.number().min(0).default(0),
  maxUses:   z.number().int().min(1).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ promos: data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch promos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error: authError } = await requireRole(["owner", "manager"]);
  if (authError) return authError;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });

    const { code, discount, minSpend, maxUses, expiresAt } = parsed.data;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("promo_codes")
      .insert({ code, discount, min_spend: minSpend, max_uses: maxUses ?? null, expires_at: expiresAt ?? null })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "A code with that name already exists." }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ promo: data });
  } catch {
    return NextResponse.json({ error: "Failed to create promo." }, { status: 500 });
  }
}
