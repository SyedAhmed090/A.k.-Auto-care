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
    const { data, error } = await sb
      .from("contact_messages")
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: data });
  } catch {
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
    const { error } = await sb.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
