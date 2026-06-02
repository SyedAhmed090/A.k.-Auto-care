import { createClient } from "@supabase/supabase-js";

// Service-role client for server-only operations (order inserts, admin reads).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
