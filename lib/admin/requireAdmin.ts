import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "./session";

/**
 * Confirms there's a valid admin session cookie. Middleware already gates
 * these routes, but we re-check here too in case this handler is ever
 * reached directly (defense in depth).
 */
export async function requireAdmin(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}
