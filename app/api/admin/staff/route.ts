import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireRole } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";
import { hashPassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  role: z.enum(["owner", "manager", "staff"]),
});

export async function GET() {
  const { error: authErr } = await requireRole(["owner"]);
  if (authErr) return authErr;

  try {
    const sb = createAdminClient();
    const { data, error } = await (sb as any)
      .from("admin_users")
      .select("id, email, role, active, created_at")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ users: data ?? [] });
  } catch (err) {
    console.error("Admin staff GET error:", err);
    return NextResponse.json({ error: "Failed to load staff." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { identity, error: authErr } = await requireRole(["owner"]);
  if (authErr) return authErr;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data. Password must be at least 8 characters." }, { status: 400 });
    }
    const email = parsed.data.email.trim().toLowerCase();
    const password_hash = await hashPassword(parsed.data.password);

    const sb = createAdminClient();
    const { data, error } = await (sb as any)
      .from("admin_users")
      .insert({ email, password_hash, role: parsed.data.role })
      .select("id, email, role, active, created_at")
      .single();

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
      }
      throw error;
    }

    await logAudit(identity, { action: "staff.create", entity: "admin_user", entityId: data.id, meta: { email, role: parsed.data.role } });
    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("Admin staff POST error:", err);
    return NextResponse.json({ error: "Failed to create staff account." }, { status: 500 });
  }
}
