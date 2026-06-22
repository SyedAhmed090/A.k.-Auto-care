import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Service-role client for server-only operations (order inserts, admin reads).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
//
// Wrapped in React cache() so multiple callers within a single request (e.g. the
// dashboard's getStats + getRecentOrders + getSettings) share one client instance
// instead of constructing a fresh one each time. The client is stateless for our
// usage (service role, no per-request auth set on it), so sharing is safe.
export const createAdminClient = cache((): ReturnType<typeof createClient<Database>> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "[A.K. Auto Care] Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }
  return createClient<Database>(url, key);
});
