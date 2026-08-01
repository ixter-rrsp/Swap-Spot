/**
 * Utility functions for extracting IP address, parsing User-Agent,
 * and verifying Cloudflare Turnstile tokens on the server.
 */

export function getIpAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }
  return "127.0.0.1";
}

export function parseUserAgent(userAgent: string | null): { browser: string; os: string } {
  if (!userAgent) {
    return { browser: "Unknown Browser", os: "Unknown OS" };
  }

  let os = "Unknown OS";
  if (/windows nt/i.test(userAgent)) os = "Windows";
  else if (/mac os x/i.test(userAgent)) os = "macOS";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";
  else if (/linux/i.test(userAgent)) os = "Linux";

  let browser = "Unknown Browser";
  if (/edg\//i.test(userAgent)) browser = "Edge";
  else if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent)) browser = "Safari";
  else if (/trident/i.test(userAgent)) browser = "Internet Explorer";

  return { browser, os };
}

export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";
  if (!token) return false;

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    const outcome = await res.json();
    return Boolean(outcome.success);
  } catch (error) {
    console.error("Turnstile token verification error:", error);
    return false;
  }
}
