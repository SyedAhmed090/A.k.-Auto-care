import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";

const updateSchema = z.object({
  active:     z.boolean().optional(),
  discount:   z.number().min(0.01).max(1).optional(),
  min_spend:  z.number().min(0).optional(),
  max_uses:   z.number().int().min(1).nullable().optional(),
  expires_at: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("promo_codes")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ promo: data });
  } catch {
    return NextResponse.json({ error: "Failed to update promo." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete promo." }, { status: 500 });
  }
}
