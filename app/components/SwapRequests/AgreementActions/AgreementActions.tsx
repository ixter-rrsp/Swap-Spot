"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./AgreementActions.module.css";
import { SwapAgreementDetail } from "@/lib/types/SwapAgreementDetail";

interface AgreementActionsProps {
  agreement: SwapAgreementDetail;
}

type ActionKind = "confirm" | "complete" | "cancel";

export default function AgreementActions({ agreement }: AgreementActionsProps) {
  const router = useRouter();

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

      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : `Failed to ${kind} agreement.`);
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