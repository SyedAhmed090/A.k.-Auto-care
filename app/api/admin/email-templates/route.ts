import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin, requireRole, getAdminSession } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";
import { logAudit } from "@/lib/audit";
import {
  getTemplates,
  invalidateTemplateCache,
  DEFAULT_TEMPLATES,
  TEMPLATE_META,
  type EmailTemplateKey,
} from "@/lib/email-templates";

const VALID_KEYS = Object.keys(DEFAULT_TEMPLATES) as EmailTemplateKey[];

const bodySchema = z.object({
  key: z.enum(VALID_KEYS as [string, ...string[]]),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(5000),
});

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const templates = await getTemplates();
    // Return in display order with labels + the current (possibly default) values.
    const list = TEMPLATE_META.map((m) => ({
      key: m.key,
      label: m.label,
      subject: templates[m.key].subject,
      body: templates[m.key].body,
      isDefault:
        templates[m.key].subject === DEFAULT_TEMPLATES[m.key].subject &&
        templates[m.key].body === DEFAULT_TEMPLATES[m.key].body,
    }));
    return NextResponse.json({ templates: list });
  } catch {
    return NextResponse.json({ error: "Failed to load templates." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireRole(["owner", "manager"]);
  if (authError) return authError;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid template data." }, { status: 400 });
    }
    const { key, subject, body } = parsed.data;

    const sb = createAdminClient();
    const { error } = await sb
      .from("email_templates")
      .upsert({ key, subject, body, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;

    invalidateTemplateCache();
    await logAudit(await getAdminSession(), { action: "email_template.update", entity: "email_template", entityId: key });
    const templates = await getTemplates();
    return NextResponse.json({ template: { key, ...templates[key as EmailTemplateKey] } });
  } catch (err) {
    console.error("Admin email-templates PATCH error:", err);
    return NextResponse.json({ error: "Failed to save template." }, { status: 500 });
  }
}
