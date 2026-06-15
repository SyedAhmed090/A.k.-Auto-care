// Audit log (#12): records who did what across sensitive admin actions.
// logAudit is best-effort — it never throws into the caller, so a logging
// failure can't break the underlying action.
import { createAdminClient } from "@/utils/supabase/admin";
import type { AdminIdentity } from "@/lib/adminToken";

export type AuditEntry = {
  action: string;            // e.g. "order.status_change", "product.delete", "login"
  entity?: string | null;    // e.g. "order", "product", "settings"
  entityId?: string | null;
  meta?: Record<string, unknown> | null;
};

export async function logAudit(identity: AdminIdentity | null, entry: AuditEntry): Promise<void> {
  try {
    const sb = createAdminClient();
    await (sb as any).from("audit_log").insert({
      admin_user_id: identity?.uid ?? null,
      admin_via: identity?.via ?? "unknown",
      action: entry.action,
      entity: entry.entity ?? null,
      entity_id: entry.entityId ?? null,
      meta: entry.meta ?? {},
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[audit] failed to record entry:", entry.action, err);
  }
}
