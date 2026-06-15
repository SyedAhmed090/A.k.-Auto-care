import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";
import { getSettings, invalidateSettingsCache, type SettingsGroup } from "@/lib/settings";
import type { Json } from "@/types/supabase";

const shippingSchema = z.object({
  freeThreshold: z.number().min(0),
  domestic: z.object({ standard: z.number().min(0), express: z.number().min(0) }),
  international: z.object({ standard: z.number().min(0), express: z.number().min(0) }),
  etas: z.object({
    domesticStandard: z.string().max(200),
    domesticExpress: z.string().max(200),
    intlStandard: z.string().max(200),
    intlExpress: z.string().max(200),
  }),
});

const taxSchema = z.object({
  gstRate: z.number().min(0).max(1),
  gstInclusive: z.boolean(),
});

const paymentSchema = z.object({
  jazzcash: z.object({ number: z.string().max(50), name: z.string().max(120) }),
  easypaisa: z.object({ number: z.string().max(50), name: z.string().max(120) }),
  bank: z.object({
    bank: z.string().max(120),
    account: z.string().max(60),
    branch: z.string().max(120),
    title: z.string().max(120),
  }),
});

const storeSchema = z.object({
  email: z.string().email().max(254),
  address: z.string().max(300),
  city: z.string().max(100),
  country: z.string().max(100),
  hours: z.string().max(120),
  mapQuery: z.string().max(300),
  whatsapp: z.string().regex(/^\d{6,15}$/, "Digits only, e.g. 923000000000"),
});

const socialSchema = z.object({
  instagram: z.string().max(300),
  facebook: z.string().max(300),
  tiktok: z.string().max(300),
  youtube: z.string().max(300),
});

const inventorySchema = z.object({
  lowStockThreshold: z.number().int().min(0).max(100000),
});

const bodySchema = z.object({
  shipping: shippingSchema.optional(),
  tax: taxSchema.optional(),
  payment: paymentSchema.optional(),
  store: storeSchema.optional(),
  social: socialSchema.optional(),
  inventory: inventorySchema.optional(),
});

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to load settings." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings data." }, { status: 400 });
    }

    const groups = Object.entries(parsed.data).filter(([, v]) => v !== undefined) as [SettingsGroup, object][];
    if (groups.length === 0) {
      return NextResponse.json({ error: "No settings provided." }, { status: 400 });
    }

    const sb = createAdminClient();
    const rows = groups.map(([key, value]) => ({ key, value: value as Json, updated_at: new Date().toISOString() }));
    const { error } = await sb.from("settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;

    invalidateSettingsCache();
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("Admin settings PATCH error:", err);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
