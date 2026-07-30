import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

/**
 * Sweeps listings whose boost has expired back to boosted = false.
 * Wire this up as a scheduled job, e.g. Vercel Cron:
 *
 *   // vercel.json
 *   { "crons": [{ "path": "/api/cron/expire-boosts", "schedule": "0 * * * *" }] }
 *
 * Protect it with a shared secret so it can't be triggered by anyone else -
 * set CRON_SECRET in your environment and Vercel will send it as a bearer
 * token automatically for configured cron jobs.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  if (!serviceClient) {
    return NextResponse.json(
      { error: "Service role client unavailable." },
      { status: 500 }
    );
  }

  const { error } = await serviceClient.rpc("expire_stale_boosts");

  if (error) {
    console.error("Failed to expire stale boosts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
