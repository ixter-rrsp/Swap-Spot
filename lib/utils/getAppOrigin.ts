/**
 * Resolves the base origin (protocol + host, no path) to build PayMongo
 * success_url / cancel_url values from.
 *
 * IMPORTANT: this now prefers NEXT_PUBLIC_APP_URL over request headers.
 * Previously the request "origin"/"referer" headers were checked first —
 * on Vercel, some requests (proxied, or where only "referer" is present)
 * come through without a clean origin, and "referer" includes the full
 * path (e.g. "https://app.vercel.app/profile"), not just the origin. That
 * produced malformed success/cancel URLs like
 * "https://app.vercel.app/profile/subscriptions?status=success" in
 * production even though everything looked fine locally.
 *
 * Set NEXT_PUBLIC_APP_URL in your Vercel project's Environment Variables
 * (Production AND Preview) to your real deployed URL, e.g.
 * "https://swapspot.vercel.app" (no trailing slash needed either way).
 */
export function getAppOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;

  const candidate =
    configured ||
    request.headers.get("origin") ||
    request.headers.get("referer") ||
    "http://localhost:3000";

  try {
    // Using the URL constructor strips any path/query that might have
    // leaked in from a "referer" header, leaving just protocol + host.
    const url = new URL(candidate);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:3000";
  }
}