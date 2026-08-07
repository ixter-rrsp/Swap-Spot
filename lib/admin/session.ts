// Lightweight signed-cookie session for the internal admin dashboard.
// Auth is a single hardcoded username/password pair (from env vars) — there's
// no "admin" table, no Supabase auth involved. We just need a tamper-proof
// cookie so we don't have to store sessions anywhere. Uses Web Crypto so it
// works in both the Edge middleware runtime and normal Node route handlers.

export const ADMIN_SESSION_COOKIE = "swapspot_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured. Set it in your environment."
    );
  }
  return secret;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(message: string): Promise<string> {
  const secret = getSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return bytesToBase64Url(signature);
}

/**
 * Verifies the hardcoded admin credentials from environment variables.
 */
export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    throw new Error(
      "ADMIN_USERNAME / ADMIN_PASSWORD are not configured on the server."
    );
  }

  return username === expectedUsername && password === expectedPassword;
}

/**
 * Creates a signed session token: `${username}.${expiresAt}.${signature}`
 */
export async function createAdminSessionToken(username: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${username}.${expiresAt}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

/**
 * Verifies a session token and returns the admin username if valid, else null.
 */
export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<string | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [username, expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);

  if (!username || !expiresAt || !signature) return null;
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return null;

  const expectedSignature = await sign(`${username}.${expiresAt}`);
  return expectedSignature === signature ? username : null;
}

export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
