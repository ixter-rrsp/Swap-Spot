import { NextResponse } from "next/server";
import { ServerPaymentService } from "@/lib/services/ServerPaymentService";

/**
 * Safety net for the payment webhook. Run every 15 minutes via Vercel
 * Cron (see vercel.json). Finds payments stuck "pending" for more than 5
 * minutes, asks PayMongo directly if they were actually paid, and applies
 * the same activation logic the webhook does — so a disabled/misconfigured
 * webhook can no longer silently strand a paid boost or subscription.
 *
 * Protected the same way as /api/cron/expire-boosts: set CRON_SECRET in
 * your environment and Vercel sends it as a bearer token automatically for
 * configured cron jobs.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await ServerPaymentService.reconcilePendingPayments();

    if (result.reconciled > 0) {
      console.log(
        `[reconcile-payments] Reconciled ${result.reconciled}/${result.checked} stale pending payment(s).`
      );
    }

    if (result.errors.length > 0) {
      console.error("[reconcile-payments] Errors during reconciliation:", result.errors);
    }

    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error: unknown) {
    console.error("[reconcile-payments] Failed:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Reconciliation failed." },
      { status: 500 }
    );
  }
}