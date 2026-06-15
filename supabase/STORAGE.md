# Supabase Storage

## `product-images` bucket

Product images uploaded from the admin product form (`/api/admin/upload`) are
stored in a Storage bucket named **`product-images`**.

- The bucket **MUST be public** (public read), because the storefront renders
  the returned public URLs directly via `getPublicUrl()`.
- The upload route auto-creates the bucket as public on first upload if it does
  not already exist (using the service-role client). No SQL migration is needed —
  Storage buckets are not table migrations and are not tracked by the numbered
  migrations in `supabase/migrations/`.

### Creating it manually (optional)

If you prefer to provision it ahead of time via the Supabase dashboard:

1. Storage → New bucket
2. Name: `product-images`
3. Toggle **Public bucket** ON
4. (Optional) Set a 5MB file size limit and restrict to image MIME types.

Writes are performed server-side with the service-role key only; the public
setting governs read access for the storefront.
