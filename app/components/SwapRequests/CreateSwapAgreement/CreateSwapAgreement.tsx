"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./CreateSwapAgreement.module.css";
import { SwapRequestDetail } from "@/lib/types/SwapRequestDetail";
import {
  swapAgreementSchema,
  SwapAgreementFormInput,
  SwapAgreementFormData,
} from "@/lib/validations/SwapAgreementSchema";

interface Props {
  swapRequestId: string;
  conversationId: string;
  onClose: () => void;
  onCreated?: (agreementId: string) => void;
}

import { getConditionLabel } from "@/lib/constants/categories";

export default function CreateSwapAgreement({
  swapRequestId,
  conversationId,
  onClose,
  onCreated,
}: Props) {
  const router = useRouter();

  const [detail, setDetail] = useState<SwapRequestDetail | null>(null);
  const [isRequester, setIsRequester] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SwapAgreementFormInput, unknown, SwapAgreementFormData>({
    resolver: zodResolver(swapAgreementSchema),
    defaultValues: {
      deliveryMethod: "meetup",
    },
  });

  const deliveryMethod = watch("deliveryMethod");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/swap-requests/${swapRequestId}`);

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError("Failed to load swap request details.");
          return;
        }

        const data: SwapRequestDetail = await response.json();
        setDetail(data);
        setIsRequester(data.currentUserId === data.sender.id);
      } catch (err) {
        console.error(err);
        setError("Failed to load swap request details.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [swapRequestId, router]);

  async function onSubmit(values: SwapAgreementFormData) {
    if (isRequester === null) return;

    setError(null);
    setSubmitting(true);

    // Map the generic "your" / "their" fields collected in the form onto
    // requester/receiver based on the current user's actual role.
    //
    // The meetup fields are hidden (and thus empty strings) when the
    // delivery method is "other_courier" — Postgres rejects "" for
    // date/time columns, so send null instead whenever a value is blank.
    const blankToNull = (value?: string | null) =>
      value && value.trim() !== "" ? value : null;

    const payload = {
      swapRequestId,
      conversationId,
      deliveryMethod: values.deliveryMethod,

      meetupLocation: blankToNull(values.meetupLocation),
      meetupDate: blankToNull(values.meetupDate),
      meetupTime: blankToNull(values.meetupTime),

      pickupAddress: blankToNull(values.pickupAddress),
      dropoffAddress: blankToNull(values.dropoffAddress),

      phoneRequester: isRequester ? values.yourPhone : values.theirPhone,
      phoneReceiver: isRequester ? values.theirPhone : values.yourPhone,
      emailRequester: isRequester ? values.yourEmail : values.theirEmail,
      emailReceiver: isRequester ? values.theirEmail : values.yourEmail,

      requesterCondition: detail?.offeredListing.condition,
      receiverCondition: detail?.requestedListing.condition,

      requesterAccessories: isRequester
        ? values.yourAccessories
        : values.theirAccessories,
      receiverAccessories: isRequester
        ? values.theirAccessories
        : values.yourAccessories,

      notes: values.notes,
    };

    try {
      const response = await fetch("/api/swap-agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to create swap agreement.");
      }

      const result = await response.json();

      onCreated?.(result.id);

      setSent(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to create swap agreement."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>

        <h2>Set up swap agreement</h2>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <p>Loading swap request...</p>
        ) : !detail ? (
          <p>Could not load this swap request.</p>
        ) : (
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className={styles.summary}>
              <span>{detail.offeredListing.title}</span>
              <span>⇄</span>
              <span>{detail.requestedListing.title}</span>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Delivery Method</h3>

              <div className={styles.radioRow}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    value="meetup"
                    {...register("deliveryMethod")}
                  />
                  Meet-up
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    value="other_courier"
                    {...register("deliveryMethod")}
                  />
                  Other Courier
                </label>
              </div>
              {errors.deliveryMethod && (
                <span className={styles.fieldError}>
                  {errors.deliveryMethod.message}
                </span>
              )}
            </div>

            {deliveryMethod === "other_courier" && (
              <div className={styles.section}>
                <p className={styles.summaryText}>
                  Once this agreement is sent and confirmed, you and the
                  other party will each fill in your own pickup details in
                  the Delivery Agreement, and courier booking instructions
                  will be generated automatically.
                </p>
              </div>
            )}

            {deliveryMethod === "meetup" && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Meetup Details</h3>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Meeting Place
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="e.g. SM North EDSA, near the cinema"
                    {...register("meetupLocation")}
                  />
                </label>
                {errors.meetupLocation && (
                  <span className={styles.fieldError}>
                    {errors.meetupLocation.message}
                  </span>
                )}

                <label className={styles.label}>
                  Meeting Date
                  <input
                    className={styles.input}
                    type="date"
                    {...register("meetupDate")}
                  />
                </label>
                {errors.meetupDate && (
                  <span className={styles.fieldError}>
                    {errors.meetupDate.message}
                  </span>
                )}

                <label className={styles.label}>
                  Meeting Time
                  <input
                    className={styles.input}
                    type="time"
                    {...register("meetupTime")}
                  />
                </label>
                {errors.meetupTime && (
                  <span className={styles.fieldError}>
                    {errors.meetupTime.message}
                  </span>
                )}
              </div>
            </div>
            )}

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Your Contact Info</h3>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Phone
                  <input
                    className={styles.input}
                    type="tel"
                    {...register("yourPhone")}
                  />
                </label>
                <label className={styles.label}>
                  Email
                  <input
                    className={styles.input}
                    type="email"
                    {...register("yourEmail")}
                  />
                </label>
                {errors.yourEmail && (
                  <span className={styles.fieldError}>
                    {errors.yourEmail.message}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Other Party&apos;s Contact Info
              </h3>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Phone
                  <input
                    className={styles.input}
                    type="tel"
                    {...register("theirPhone")}
                  />
                </label>
                <label className={styles.label}>
                  Email
                  <input
                    className={styles.input}
                    type="email"
                    {...register("theirEmail")}
                  />
                </label>
                {errors.theirEmail && (
                  <span className={styles.fieldError}>
                    {errors.theirEmail.message}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Item Condition</h3>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {detail.offeredListing.title}
                  <span className={styles.readOnlyValue}>
                    {getConditionLabel(detail.offeredListing.condition)}
                  </span>
                </label>

                <label className={styles.label}>
                  {detail.requestedListing.title}
                  <span className={styles.readOnlyValue}>
                    {getConditionLabel(detail.requestedListing.condition)}
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Accessories Included</h3>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  With your item
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    placeholder="e.g. original box, charger"
                    {...register("yourAccessories")}
                  />
                </label>
                <label className={styles.label}>
                  With their item
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    {...register("theirAccessories")}
                  />
                </label>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Notes</h3>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="Anything else both parties should know"
                {...register("notes")}
              />
            </div>

            <button
              type="submit"
              className={styles.submit}
              disabled={submitting || sent}
            >
              {sent
                ? "Agreement Sent ✓"
                : submitting
                  ? "Sending..."
                  : "Send Agreement"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}