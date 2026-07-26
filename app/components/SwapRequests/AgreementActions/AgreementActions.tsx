"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./AgreementActions.module.css";
import { SwapAgreementDetail } from "@/lib/types/SwapAgreementDetail";
import { useToast } from "@/app/components/UI/Toast/ToastContext";

interface AgreementActionsProps {
  agreement: SwapAgreementDetail;
}

type ActionKind = "confirm" | "complete" | "cancel";

export default function AgreementActions({ agreement }: AgreementActionsProps) {
  const router = useRouter();
  const toast = useToast();

  const [pendingAction, setPendingAction] = useState<ActionKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRequester = agreement.currentUserId === agreement.requesterId;

  const hasConfirmed = isRequester
    ? !!agreement.requesterConfirmedAt
    : !!agreement.receiverConfirmedAt;

  const hasCompleted = isRequester
    ? !!agreement.requesterCompletedAt
    : !!agreement.receiverCompletedAt;

  const canConfirm =
    agreement.status === "pending_confirmation" && !hasConfirmed;

  const canComplete = agreement.status === "confirmed" && !hasCompleted;

  const canCancel =
    agreement.status !== "completed" && agreement.status !== "cancelled";

  const deliveryLabel =
    agreement.deliveryMethod === "meetup"
      ? "Meetup handoff"
      : agreement.deliveryMethod === "lalamove" || agreement.deliveryMethod === "other_courier"
        ? "Delivery arranged"
        : "Delivery method";

  const nextStepLabel = canConfirm
    ? "Ready to confirm the agreement"
    : canComplete
      ? "Ready to mark the swap as complete"
      : "Next step is to keep the handoff clear";

  async function runAction(kind: ActionKind) {
    setError(null);
    setPendingAction(kind);

    try {
      const response = await fetch(
        `/api/swap-agreements/${agreement.id}/${kind}`,
        { method: "PATCH" }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `Failed to ${kind} agreement.`);
      }

      const successMessage =
        kind === "confirm"
          ? "Agreement confirmed. The next step is to complete the swap after the exchange."
          : kind === "complete"
            ? "Swap marked as complete. Thanks for closing the loop."
            : "Agreement cancelled. The swap is no longer active.";

      toast(successMessage, "success");
      router.refresh();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : `Failed to ${kind} agreement.`;
      setError(message);
      toast(message, "error");
    } finally {
      setPendingAction(null);
    }
  }

  function confirmAction(kind: ActionKind) {
    const promptMessage =
      kind === "complete"
        ? "Mark this swap as completed?"
        : kind === "cancel"
          ? "Cancel this swap agreement?"
          : "Confirm this swap agreement?";

    if (window.confirm(promptMessage)) {
      void runAction(kind);
    }
  }

  if (agreement.status === "completed" || agreement.status === "cancelled") {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.metaRow}>
        <span className={styles.metaPill}>{deliveryLabel}</span>
        <span className={styles.metaPill}>{nextStepLabel}</span>
      </div>

      {agreement.status === "pending_confirmation" && (
        <p className={styles.hint}>
          {hasConfirmed
            ? "Waiting for the other party to confirm."
            : "Review the details above, then confirm to proceed."}
        </p>
      )}

      {agreement.status === "confirmed" && (
        <p className={styles.hint}>
          {hasCompleted
            ? "Waiting for the other party to mark this as completed."
            : "Once the exchange has happened, mark it as completed."}
        </p>
      )}

      <div className={styles.buttonRow}>
        {(agreement.deliveryMethod === "lalamove" || agreement.deliveryMethod === "other_courier") && (
          <Link href={`/agreements/${agreement.id}/delivery`} className={styles.confirmButton}>
            Manage Delivery
          </Link>
        )}

        {canConfirm && (
          <button
            className={styles.confirmButton}
            disabled={pendingAction !== null}
            onClick={() => confirmAction("confirm")}
          >
            {pendingAction === "confirm" ? "Confirming..." : "Confirm Agreement"}
          </button>
        )}

        {canComplete && (
          <button
            className={styles.completeButton}
            disabled={pendingAction !== null}
            onClick={() => confirmAction("complete")}
          >
            {pendingAction === "complete" ? "Completing..." : "Complete Swap"}
          </button>
        )}

        {canCancel && (
          <button
            className={styles.cancelButton}
            disabled={pendingAction !== null}
            onClick={() => confirmAction("cancel")}
          >
            {pendingAction === "cancel" ? "Cancelling..." : "Cancel Agreement"}
          </button>
        )}
      </div>
    </div>
  );
}