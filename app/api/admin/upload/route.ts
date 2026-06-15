// Product image upload endpoint.
//
// Files are stored in the Supabase Storage bucket "product-images", which MUST
// be PUBLIC (public read) so the storefront can render the returned URLs.
// The bucket is auto-created (public) on first upload if it does not exist;
// it can also be created manually via the Supabase dashboard.
// See supabase/STORAGE.md for details.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkCsrf } from "@/lib/csrf";
import { requireAdmin } from "@/lib/adminAuth";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // ~5MB

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPEG, PNG, WebP, GIF or AVIF." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 400 });
    }

    const sb = createAdminClient();

    // Ensure the bucket exists (public). Best-effort: ignore "already exists".
    const { error: getErr } = await sb.storage.getBucket(BUCKET);
    if (getErr) {
      const { error: createErr } = await sb.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_BYTES,
      });
      // A concurrent request may have created it first — only fail on real errors.
      if (createErr && !/exist/i.test(createErr.message)) {
        return NextResponse.json(
          { error: "Storage bucket unavailable." },
          { status: 500 }
        );
      }
    }

    const path = `${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadErr } = await sb.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (uploadErr) {
      return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }

    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
