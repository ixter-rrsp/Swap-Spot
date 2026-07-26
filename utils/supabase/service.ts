import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceRole) {
    return null;
  }

  // This client uses the service role key and should only be used in server
  // environments (Edge / Server functions). It bypasses RLS and has elevated
  // privileges — keep the key secret.
  return createServerClient(supabaseUrl, supabaseServiceRole, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}

export default createServiceClient;
