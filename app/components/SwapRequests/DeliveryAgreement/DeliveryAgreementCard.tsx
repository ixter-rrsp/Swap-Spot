"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./DeliveryAgreementCard.module.css";
import { useToast } from "@/app/components/UI/Toast/ToastContext";
import {
  DeliveryAgreementDetail,
  DeliveryAgreementStatus,
} from "@/lib/types/DeliveryAgreement";
import {
  deliveryInfoSchema,
  DeliveryInfoFormData,
  courierBookingSchema,
  CourierBookingFormData,
  COURIER_OPTIONS,
} from "@/lib/validations/DeliveryAgreementSchema";

interface DeliveryAgreementCardProps {
  swapAgreementId: string;
}

const STATUS_STEPS: { key: DeliveryAgreementStatus; label: string }[] = [
  { key: "awaiting_info", label: "Waiting for User Information" },
  { key: "ready_to_book", label: "Ready to Book Courier" },
  { key: "booked", label: "Courier Booked" },
  { key: "picked_up", label: "Picked Up" },
];

function stepIndex(status: DeliveryAgreementStatus) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function courierLabel(value?: string | null) {
  return COURIER_OPTIONS.find((c) => c.value === value)?.label || value || "—";
}

export default function DeliveryAgreementCard({
  swapAgreementId,
}: DeliveryAgreementCardProps) {
  const router = useRouter();
  const toast = useToast();

  const [agreement, setAgreement] = useState<DeliveryAgreementDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/delivery-agreements/${swapAgreementId}`
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to load delivery agreement.");
      }

      const data: DeliveryAgreementDetail = await response.json();
      setAgreement(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to load delivery agreement."
      );
    } finally {
      setLoading(false);
    }
  }, [swapAgreementId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const infoForm = useForm<DeliveryInfoFormData>({
    resolver: zodResolver(deliveryInfoSchema),
  });

  const bookingForm = useForm<CourierBookingFormData>({
    resolver: zodResolver(courierBookingSchema),
    defaultValues: { courier: "lalamove" },
  });

  async function onSubmitInfo(values: DeliveryInfoFormData) {
    if (!agreement) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/delivery-agreements/${agreement.id}/info`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to submit delivery info.");
      }

      toast("Delivery information saved.", "success");
      await load();
      router.refresh();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to submit delivery info.";
      setError(message);
      toast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitBooking(values: CourierBookingFormData) {
    if (!agreement) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/delivery-agreements/${agreement.id}/booking`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to submit courier booking.");
      }

      toast("Courier booking submitted.", "success");
      await load();
      router.refresh();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to submit courier booking.";
      setError(message);
      toast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function onMarkPickedUp() {
    if (!agreement) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/delivery-agreements/${agreement.id}/picked-up`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to mark as picked up.");
      }

      toast("Marked as picked up.", "success");
      await load();
      router.refresh();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to mark as picked up.";
      setError(message);
      toast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function onCopyInstructions() {
    if (!agreement?.myBookingInstructions) return;
    const text = formatInstructionsText(agreement.myBookingInstructions);
    try {
      await navigator.clipboard.writeText(text);
      toast("Booking details copied.", "success");
    } catch {
      toast("Couldn't copy — please copy manually.", "error");
    }
  }

  if (loading) {
    return <div className={styles.card}>Loading delivery agreement...</div>;
  }

  if (error && !agreement) {
    return <div className={styles.card}>{error}</div>;
  }

  if (!agreement) {
    return null;
  }

  const me = agreement.isRequester ? agreement.requester : agreement.receiver;
  const them = agreement.isRequester ? agreement.receiver : agreement.requester;

  const myInfoDone = !!me.infoSubmittedAt;
  const theirInfoDone = !!them.infoSubmittedAt;
  const myBookingDone = !!me.bookingSubmittedAt;
  const theirBookingDone = !!them.bookingSubmittedAt;
  const myPickedUp = !!me.pickedUpAt;
  const theirPickedUp = !!them.pickedUpAt;

  const currentStepIndex = stepIndex(agreement.status);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>🚚</span>
        <div>
          <p className={styles.heading}>Delivery Agreement</p>
          <p className={styles.subheading}>
            Manual courier booking — book with any courier you like.
          </p>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.progress}>
        {STATUS_STEPS.map((step, idx) => (
          <div
            key={step.key}
            className={`${styles.progressStep} ${
              idx <= currentStepIndex ? styles.progressStepDone : ""
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>

      <div className={styles.completionRow}>
        <span className={`${styles.pill} ${myInfoDone ? styles.pillDone : ""}`}>
          You {myInfoDone ? "✓ completed info" : "— info needed"}
        </span>
        <span
          className={`${styles.pill} ${theirInfoDone ? styles.pillDone : ""}`}
        >
          Other party {theirInfoDone ? "✓ completed info" : "— waiting"}
        </span>
      </div>

      {!myInfoDone && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Delivery Information</h3>
          <p className={styles.hint}>
            This is where the courier will pick up the item you&apos;re
            sending. Your drop-off address is never asked for here — it&apos;s
            automatically the other party&apos;s saved address.
          </p>

          <form
            className={styles.form}
            onSubmit={infoForm.handleSubmit(onSubmitInfo)}
          >
            <label className={styles.label}>
              Full Name
              <input className={styles.input} {...infoForm.register("fullName")} />
            </label>
            {infoForm.formState.errors.fullName && (
              <span className={styles.fieldError}>
                {infoForm.formState.errors.fullName.message}
              </span>
            )}

            <label className={styles.label}>
              Mobile Number
              <input className={styles.input} {...infoForm.register("mobileNumber")} />
            </label>
            {infoForm.formState.errors.mobileNumber && (
              <span className={styles.fieldError}>
                {infoForm.formState.errors.mobileNumber.message}
              </span>
            )}

            <label className={styles.label}>
              Pickup Address
              <input className={styles.input} {...infoForm.register("pickupAddress")} />
            </label>
            {infoForm.formState.errors.pickupAddress && (
              <span className={styles.fieldError}>
                {infoForm.formState.errors.pickupAddress.message}
              </span>
            )}

            <label className={styles.label}>
              Unit / Floor (optional)
              <input className={styles.input} {...infoForm.register("unitFloor")} />
            </label>

            <label className={styles.label}>
              Landmark (optional)
              <input className={styles.input} {...infoForm.register("landmark")} />
            </label>

            <label className={styles.label}>
              Pickup Notes (optional)
              <textarea
                className={styles.textarea}
                rows={2}
                {...infoForm.register("pickupNotes")}
              />
            </label>

            <button className={styles.submit} type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Delivery Information"}
            </button>
          </form>
        </section>
      )}

      {myInfoDone && !theirInfoDone && (
        <p className={styles.hint}>
          Waiting for the other party to complete their delivery information.
        </p>
      )}

      {myInfoDone && theirInfoDone && agreement.myBookingInstructions && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Booking Instructions</h3>
          <p className={styles.hint}>
            Book a courier (Lalamove, GrabExpress, Borzo, LBC, J&amp;T, or
            any other) using the details below.
          </p>

          <div className={styles.instructionsCard}>
            <InstructionsBlock instructions={agreement.myBookingInstructions} />
          </div>

          <button
            type="button"
            className={styles.copyButton}
            onClick={onCopyInstructions}
          >
            Copy Booking Details
          </button>
        </section>
      )}

      {myInfoDone && theirInfoDone && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Courier Booking Confirmation</h3>

          <div className={styles.completionRow}>
            <span
              className={`${styles.pill} ${myBookingDone ? styles.pillDone : ""}`}
            >
              You {myBookingDone ? "✓ booked" : "— not booked yet"}
            </span>
            <span
              className={`${styles.pill} ${theirBookingDone ? styles.pillDone : ""}`}
            >
              Other party {theirBookingDone ? "✓ booked" : "— waiting"}
            </span>
          </div>

          {myBookingDone ? (
            <div className={styles.bookedSummary}>
              <p>
                <strong>Courier:</strong> {courierLabel(me.courier)}
              </p>
              <p>
                <strong>Tracking / Reference:</strong> {me.trackingNumber}
              </p>
              {me.trackingUrl && (
                <p>
                  <strong>Tracking URL:</strong>{" "}
                  <a href={me.trackingUrl} target="_blank" rel="noreferrer">
                    {me.trackingUrl}
                  </a>
                </p>
              )}
            </div>
          ) : (
            <form
              className={styles.form}
              onSubmit={bookingForm.handleSubmit(onSubmitBooking)}
            >
              <label className={styles.label}>
                Courier
                <select
                  className={styles.input}
                  {...bookingForm.register("courier")}
                >
                  {COURIER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.label}>
                Booking Reference / Tracking Number
                <input
                  className={styles.input}
                  {...bookingForm.register("trackingNumber")}
                />
              </label>
              {bookingForm.formState.errors.trackingNumber && (
                <span className={styles.fieldError}>
                  {bookingForm.formState.errors.trackingNumber.message}
                </span>
              )}

              <label className={styles.label}>
                Tracking URL (optional)
                <input
                  className={styles.input}
                  placeholder="https://..."
                  {...bookingForm.register("trackingUrl")}
                />
              </label>
              {bookingForm.formState.errors.trackingUrl && (
                <span className={styles.fieldError}>
                  {bookingForm.formState.errors.trackingUrl.message}
                </span>
              )}

              <button className={styles.submit} type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Courier Booking"}
              </button>
            </form>
          )}

          {theirBookingDone && (
            <div className={styles.bookedSummary}>
              <p className={styles.hint}>Other party&apos;s tracking info:</p>
              <p>
                <strong>Courier:</strong> {courierLabel(them.courier)}
              </p>
              <p>
                <strong>Tracking / Reference:</strong> {them.trackingNumber}
              </p>
              {them.trackingUrl && (
                <p>
                  <strong>Tracking URL:</strong>{" "}
                  <a href={them.trackingUrl} target="_blank" rel="noreferrer">
                    {them.trackingUrl}
                  </a>
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {agreement.status === "booked" || agreement.status === "picked_up" ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Pickup</h3>
          <div className={styles.completionRow}>
            <span
              className={`${styles.pill} ${myPickedUp ? styles.pillDone : ""}`}
            >
              You {myPickedUp ? "✓ picked up" : "— not yet"}
            </span>
            <span
              className={`${styles.pill} ${theirPickedUp ? styles.pillDone : ""}`}
            >
              Other party {theirPickedUp ? "✓ picked up" : "— waiting"}
            </span>
          </div>
          {!myPickedUp && (
            <button
              type="button"
              className={styles.submit}
              onClick={onMarkPickedUp}
              disabled={submitting}
            >
              Mark as Picked Up
            </button>
          )}
          <p className={styles.hint}>
            Once your item has been delivered, confirm receipt from the
            agreement page to complete the swap.
          </p>
        </section>
      ) : null}
    </div>
  );
}

function InstructionsBlock({
  instructions,
}: {
  instructions: NonNullable<DeliveryAgreementDetail["myBookingInstructions"]>;
}) {
  return (
    <pre className={styles.instructionsText}>
      {formatInstructionsText(instructions)}
    </pre>
  );
}

function formatInstructionsText(
  instructions: NonNullable<DeliveryAgreementDetail["myBookingInstructions"]>
) {
  const lines = [
    "Please book a courier.",
    "",
    "Pickup",
    instructions.pickup.name,
    instructions.pickup.phone,
    instructions.pickup.address,
  ];

  if (instructions.pickup.unitOrLandmark) {
    lines.push(instructions.pickup.unitOrLandmark);
  }

  lines.push(
    "",
    "Receiver",
    instructions.receiver.name,
    instructions.receiver.phone,
    "",
    "Drop-off",
    instructions.dropoffAddress,
    "",
    "Item",
    instructions.itemTitle
  );

  if (instructions.notes) {
    lines.push("", "Notes", instructions.notes);
  }

  return lines.join("\n");
}
