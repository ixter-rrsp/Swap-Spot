"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { PaymentService } from "@/lib/services/PaymentService";
import { useToast } from "@/app/components/UI/Toast/ToastContext";
import styles from "./BoostReturnHandler.module.css";

interface BoostReturnHandlerProps {
  listingId: string;
}

/**
 * PayMongo's success_url can't carry the checkout_session_id (no
 * {CHECKOUT_SESSION_ID} template substitution like Stripe), so when the
 * boost checkout route sends the user back to /Listing/[id]?boost_status=success
 * there's no session id in the URL. We look up the user's most recent
 * "listing_boost" payment for this listing instead, then verify it —
 * this is what actually sets payments.status/paid_at and activates the
 * boost, as a fallback in case the PayMongo webhook hasn't landed yet.
 */
export default function BoostReturnHandler({
  listingId,
}: BoostReturnHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const boostStatus = searchParams.get("boost_status");
  const hasRun = useRef(false);

  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!boostStatus || hasRun.current) return;
    hasRun.current = true;

    async function cleanUrl() {
      const url = new URL(window.location.href);
      url.searchParams.delete("boost_status");
      router.replace(url.pathname + url.search, { scroll: false });
    }

    async function verifyBoost() {
      if (boostStatus === "cancelled") {
        setBanner({
          type: "error",
          text: "Boost payment was cancelled. You can try again anytime.",
        });
        await cleanUrl();
        return;
      }

      if (boostStatus !== "success") return;

      try {
        const lookup = await fetch(
          `/api/payments/latest-pending?purpose=listing_boost&referenceId=${encodeURIComponent(
            listingId
          )}`
        );

        if (!lookup.ok) {
          throw new Error("Could not find the boost payment to verify.");
        }

        const { checkoutSessionId } = await lookup.json();

        if (!checkoutSessionId) {
          throw new Error("Could not determine which payment to verify.");
        }

        const result = await PaymentService.verifyPayment(checkoutSessionId);

        if (result.status === "paid") {
          setBanner({
            type: "success",
            text: "🚀 Payment verified! Your listing is now boosted.",
          });
          toast("Listing boosted successfully!", "success");
          router.refresh();
        } else {
          setBanner({
            type: "error",
            text: "We received your payment redirect. Status update in progress — refresh in a moment.",
          });
        }
      } catch (err: unknown) {
        console.warn("Boost payment verification failed:", err);
        setBanner({
          type: "error",
          text: "We received your payment redirect, but couldn't confirm the payment yet. If the charge went through, it will activate shortly.",
        });
      } finally {
        await cleanUrl();
      }
    }

    verifyBoost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boostStatus, listingId]);

  if (!banner) return null;

  return (
    <div
      className={
        banner.type === "success" ? styles.bannerSuccess : styles.bannerError
      }
    >
      {banner.type === "success" ? (
        <CheckCircle2 size={18} />
      ) : (
        <AlertCircle size={18} />
      )}
      <span>{banner.text}</span>
    </div>
  );
}

