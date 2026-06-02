import { createClient } from "@supabase/supabase-js";

// Service-role client for server-only operations (order inserts, admin reads).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "[A.K. Auto Care] Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }
  return createClient(url, key);
};
