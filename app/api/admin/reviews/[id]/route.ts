import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";

const patchSchema = z.object({
  approved: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid fields." }, { status: 400 });
  const { approved } = parsed.data;

  try {
    const sb = createAdminClient();
    const { error } = await sb.from("reviews").update({ approved }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin review PATCH error:", err);
    return NextResponse.json({ error: "Failed to update review." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  try {
    const sb = createAdminClient();
    const { error } = await sb.from("reviews").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin review DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete review." }, { status: 500 });
  }
}
