import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendStatusEmail } from "@/lib/email";

const ORDER_STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"] as const;

const updateSchema = z.object({
  status:          z.enum(ORDER_STATUSES).optional(),
  tracking_number: z.string().max(100).optional(),
  notes:           z.string().max(1000).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });

    const supabase = createAdminClient();

    // Fetch current order to detect status change and get email fields
    const { data: current } = await supabase
      .from("orders")
      .select("status, email, first_name, tracking_number, total")
      .eq("id", id)
      .single();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.status           !== undefined) updates.status           = parsed.data.status;
    if (parsed.data.tracking_number  !== undefined) updates.tracking_number  = parsed.data.tracking_number;
    if (parsed.data.notes            !== undefined) updates.notes            = parsed.data.notes;

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Send email if status changed
    if (current && parsed.data.status && parsed.data.status !== current.status) {
      await sendStatusEmail(
        {
          id,
          email:           current.email,
          first_name:      current.first_name,
          tracking_number: parsed.data.tracking_number ?? current.tracking_number,
          total:           current.total,
        },
        parsed.data.status
      );
    }

    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
