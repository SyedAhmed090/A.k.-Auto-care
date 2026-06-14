import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkCsrf } from "@/lib/csrf";
import { requireAdmin } from "@/lib/adminAuth";

const ORDER_STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"] as const;

const schema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(ORDER_STATUSES),
});

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });

    const { ids, status } = parsed.data;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) throw error;
    return NextResponse.json({ updated: ids.length });
  } catch {
    return NextResponse.json({ error: "Bulk update failed." }, { status: 500 });
  }
}
