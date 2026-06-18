import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkCsrf } from "@/lib/csrf";
import { requireAdmin } from "@/lib/adminAuth";

const updateSchema = z.object({
  status: z.enum(["new", "read", "handled"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });

    const sb = createAdminClient();
    // A-05: Use maybeSingle() instead of single() so a missing row returns null
    // (not an error), allowing us to return 404 instead of 500.
    const { data, error } = await sb
      .from("contact_messages")
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Contact message PATCH error:", error);
      return NextResponse.json({ error: "Failed to update message." }, { status: 500 });
    }
    // A-05: Return 404 when the row does not exist rather than 500.
    if (!data) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }
    return NextResponse.json({ message: data });
  } catch (err) {
    console.error("Contact message PATCH error:", err);
    return NextResponse.json({ error: "Failed to update message." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const sb = createAdminClient();

    // A-05: Check if the row exists before deleting so we can return 404 for
    // non-existent ids rather than a misleading 200 {ok:true}.
    const { data: existing, error: fetchError } = await sb
      .from("contact_messages")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Contact message DELETE fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    const { error } = await sb.from("contact_messages").delete().eq("id", id);
    if (error) {
      console.error("Contact message DELETE error:", error);
      return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact message DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
