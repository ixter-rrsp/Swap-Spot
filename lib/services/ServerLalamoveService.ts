import crypto from "crypto";

const LALAMOVE_ENV = process.env.LALAMOVE_ENV ?? "sandbox"; // 'sandbox' or 'production'
const LALAMOVE_API_KEY = process.env.LALAMOVE_API_KEY;
const LALAMOVE_API_SECRET = process.env.LALAMOVE_API_SECRET;
const LALAMOVE_MARKET = process.env.LALAMOVE_MARKET ?? "PH";

function ensureLalamoveCredentials() {
  if (!LALAMOVE_API_KEY || !LALAMOVE_API_SECRET) {
    throw new Error("Lalamove credentials are not configured. Add LALAMOVE_API_KEY and LALAMOVE_API_SECRET to the server environment.");
  }
}

function baseUrl() {
  return LALAMOVE_ENV === "production"
    ? "https://rest.lalamove.com/v3"
    : "https://rest.sandbox.lalamove.com/v3";
}

function hmacSignature(timestamp: string, method: string, path: string, body: string) {
  ensureLalamoveCredentials();

  const raw = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`;
  const hmac = crypto.createHmac("sha256", LALAMOVE_API_SECRET as string);
  hmac.update(raw);
  return hmac.digest("hex");
}

function authHeaders(method: string, path: string, bodyObj: any = null) {
  ensureLalamoveCredentials();

  const body = bodyObj ? JSON.stringify(bodyObj) : "";
  const ts = Date.now().toString();
  const sig = hmacSignature(ts, method.toUpperCase(), path, body);
  const token = `${LALAMOVE_API_KEY}:${ts}:${sig}`;
  return {
    Authorization: `hmac ${token}`,
    Market: LALAMOVE_MARKET,
    "Request-ID": crypto.randomUUID(),
    "Content-Type": "application/json",
  };
}

async function request(path: string, method: string = "POST", body: any = null) {
  const url = `${baseUrl()}${path}`;
  const headers = authHeaders(method, path, body);

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify({ data: body }) : undefined,
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      const err = new Error(`Lalamove API error: ${res.status} ${res.statusText}`);
      // @ts-ignore
      err.details = json;
      throw err;
    }
    return json.data ?? json;
  } catch (e) {
    if (!res.ok) throw new Error(`Lalamove non-JSON error: ${res.status} ${text}`);
    return text;
  }
}

export async function createQuotation(payload: any) {
  return request(`/quotations`, "POST", payload);
}

export async function getQuotation(quotationId: string) {
  return request(`/quotations/${quotationId}`, "GET", null);
}

export async function placeOrder(payload: any) {
  return request(`/orders`, "POST", payload);
}

export async function getOrder(orderId: string) {
  return request(`/orders/${orderId}`, "GET", null);
}

export default {
  createQuotation,
  getQuotation,
  placeOrder,
  getOrder,
};
