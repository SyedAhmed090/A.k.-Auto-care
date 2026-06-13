import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { approved } = body as Record<string, unknown>;
  if (typeof approved !== "boolean") {
    return NextResponse.json({ error: "approved must be a boolean." }, { status: 400 });
  }

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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
