"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, Zap, AlertCircle, Loader2 } from "lucide-react";
import { SUBSCRIPTION_PLANS, PlanId, SubscriptionPlanConfig } from "@/lib/subscriptions/plans";
import { SubscriptionService, SubscriptionResponse } from "@/lib/services/SubscriptionService";
import { PaymentService } from "@/lib/services/PaymentService";
import styles from "./page.module.css";

function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const statusParam = searchParams.get("status");

  const [currentSub, setCurrentSub] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "cancelled" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // If returning from checkout with session_id, verify payment first
        if (sessionId && statusParam === "success") {
          try {
            await PaymentService.verifyPayment(sessionId);
            setBannerMessage({
              type: "success",
              text: "🎉 Payment verified! Your new subscription plan has been successfully activated.",
            });
          } catch (err: any) {
            console.warn("Payment verification on landing failed:", err);
            setBannerMessage({
              type: "error",
              text: "We received your payment redirect. Status update in progress...",
            });
          }
        } else if (statusParam === "cancelled") {
          setBannerMessage({
            type: "cancelled",
            text: "Payment was cancelled. You can choose a plan and try again anytime.",
          });
        }

        const sub = await SubscriptionService.getCurrentSubscription();
        setCurrentSub(sub);
      } catch (err: any) {
        console.error("Failed to load active subscription:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sessionId, statusParam]);

  const handleSubscribe = async (planId: PlanId) => {
    if (planId === "free") return;

    try {
      setSubmittingPlanId(planId);
      const { checkoutUrl } = await SubscriptionService.initiateCheckout(planId);
      // Redirect to PayMongo Checkout Sandbox
      window.location.href = checkoutUrl;
    } catch (err: any) {
      alert(err.message || "Failed to start checkout. Please try again.");
      setSubmittingPlanId(null);
    }
  };

  const planList: SubscriptionPlanConfig[] = [
    SUBSCRIPTION_PLANS.free,
    SUBSCRIPTION_PLANS.basic,
    SUBSCRIPTION_PLANS.premium,
    SUBSCRIPTION_PLANS.vip,
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>SwapSpot Membership Plans</h1>
        <p className={styles.subtitle}>
          Unlock unlimited item listings, gain trusted badges, and maximize your swapping reach.
        </p>
      </div>

      {bannerMessage && (
        <div
          className={
            bannerMessage.type === "success"
              ? styles.bannerSuccess
              : bannerMessage.type === "cancelled"
              ? styles.bannerCancelled
              : styles.bannerCancelled
          }
        >
          {bannerMessage.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Current Active Plan Summary Card */}
      {loading ? (
        <div className={styles.currentPlanCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Loader2 size={24} className="animate-spin" />
            <span>Loading your active subscription details...</span>
          </div>
        </div>
      ) : currentSub ? (
        <div className={styles.currentPlanCard}>
          <div className={styles.currentInfo}>
            <span className={styles.currentLabel}>Your Active Membership</span>
            <div className={styles.currentPlanTitle}>
              <span>{currentSub.plan.name} Plan</span>
              <span
                className={styles.badgePill}
                style={{
                  backgroundColor: currentSub.plan.badgeBg,
                  color: currentSub.plan.badgeColor,
                }}
              >
                <ShieldCheck size={14} />
                {currentSub.plan.badgeName}
              </span>
            </div>
            <div className={styles.expiryText}>
              {currentSub.planId === "free" ? (
                "Lifetime Free Access — Max 5 Active Listings"
              ) : currentSub.expiresAt ? (
                <>
                  Valid until{" "}
                  <strong>{new Date(currentSub.expiresAt).toLocaleDateString()}</strong> (
                  <span className={styles.daysHighlight}>{currentSub.remainingDays} days remaining</span>)
                </>
              ) : (
                "Active Subscription"
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Grid of Plans */}
      <div className={styles.plansGrid}>
        {planList.map((plan) => {
          const isCurrentPlan = currentSub?.planId === plan.id;
          const isVip = plan.id === "vip";
          const isSubmitting = submittingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`${styles.planCard} ${isCurrentPlan ? styles.activePlanCard : ""} ${
                isVip ? styles.vipPlanCard : ""
              }`}
            >
              {isVip && <span className={styles.popularTag}>Best Value</span>}

              <div>
                <div className={styles.planHeader}>
                  <div className={styles.planName}>
                    <span>{plan.name}</span>
                    <span
                      className={styles.badgePill}
                      style={{ backgroundColor: plan.badgeBg, color: plan.badgeColor }}
                    >
                      {plan.badgeName}
                    </span>
                  </div>
                  <p className={styles.planDesc}>{plan.description}</p>
                </div>

                <div className={styles.priceContainer}>
                  {plan.price === 0 ? (
                    <span className={styles.price}>Free</span>
                  ) : (
                    <>
                      <span className={styles.currency}>₱</span>
                      <span className={styles.price}>{plan.price}</span>
                      <span className={styles.period}> / {plan.durationMonths} months</span>
                    </>
                  )}
                </div>

                <ul className={styles.featureList}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={styles.featureItem}>
                      <CheckCircle2 size={16} className={styles.checkIcon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {isCurrentPlan ? (
                  <button className={`${styles.actionButton} ${styles.disabledBtn}`} disabled>
                    Current Plan
                  </button>
                ) : plan.id === "free" ? (
                  <button className={`${styles.actionButton} ${styles.disabledBtn}`} disabled>
                    Default Tier
                  </button>
                ) : (
                  <button
                    className={`${styles.actionButton} ${isVip ? styles.vipBtn : styles.primaryBtn}`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={submittingPlanId !== null}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting to PayMongo...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        {currentSub?.planId === "vip"
                          ? "Switch Plan"
                          : isVip
                          ? "Get VIP Access"
                          : `Upgrade to ${plan.name}`}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 20px" }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      </div>
    }>
      <SubscriptionsContent />
    </Suspense>
  );
}
