import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

const updateSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  tracking_number: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
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
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });

    const supabase = createAdminClient();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.status) updates.status = parsed.data.status;
    if (parsed.data.tracking_number !== undefined) updates.tracking_number = parsed.data.tracking_number;
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

    const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
