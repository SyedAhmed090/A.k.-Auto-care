import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireRole } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";
import { hashPassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  role: z.enum(["owner", "manager", "staff"]).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).max(200).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { identity, error: authErr } = await requireRole(["owner"]);
  if (authErr) return authErr;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    // Guard against self-lockout: an owner can't deactivate/demote their own account.
    if (identity.via === "user" && identity.uid === id && (parsed.data.active === false || parsed.data.role)) {
      return NextResponse.json({ error: "You can't change your own role or status." }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.role !== undefined) updates.role = parsed.data.role;
    if (parsed.data.active !== undefined) updates.active = parsed.data.active;
    if (parsed.data.password !== undefined) updates.password_hash = await hashPassword(parsed.data.password);
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const sb = createAdminClient();
    const { data, error } = await (sb as any)
      .from("admin_users")
      .update(updates)
      .eq("id", id)
      .select("id, email, role, active, created_at")
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Staff account not found." }, { status: 404 });

    await logAudit(identity, {
      action: "staff.update",
      entity: "admin_user",
      entityId: id,
      meta: { role: parsed.data.role, active: parsed.data.active, passwordReset: parsed.data.password !== undefined },
    });
    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("Admin staff PATCH error:", err);
    return NextResponse.json({ error: "Failed to update staff account." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { identity, error: authErr } = await requireRole(["owner"]);
  if (authErr) return authErr;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    if (identity.via === "user" && identity.uid === id) {
      return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
    }

    const sb = createAdminClient();
    const { error } = await (sb as any).from("admin_users").delete().eq("id", id);
    if (error) throw error;

    await logAudit(identity, { action: "staff.delete", entity: "admin_user", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin staff DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete staff account." }, { status: 500 });
  }
}
