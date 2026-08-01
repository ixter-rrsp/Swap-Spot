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

const CONDITION_OPTIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "needs_repair", label: "Needs Repair" },
] as const;

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
    const payload = {
      swapRequestId,
      conversationId,
      deliveryMethod: values.deliveryMethod,

      meetupLocation: values.meetupLocation,
      meetupDate: values.meetupDate,
      meetupTime: values.meetupTime,

      pickupAddress: values.pickupAddress,
      dropoffAddress: values.dropoffAddress,

      phoneRequester: isRequester ? values.yourPhone : values.theirPhone,
      phoneReceiver: isRequester ? values.theirPhone : values.yourPhone,
      emailRequester: isRequester ? values.yourEmail : values.theirEmail,
      emailReceiver: isRequester ? values.theirEmail : values.yourEmail,

      requesterCondition: isRequester
        ? values.yourCondition
        : values.theirCondition,
      receiverCondition: isRequester
        ? values.theirCondition
        : values.yourCondition,

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

      if (values.deliveryMethod === "other_courier") {
        onClose();
        router.push(`/agreements/${result.id}/delivery`);
        return;
      }

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
                  Meet up
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

              {deliveryMethod === "meetup" && (
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
              )}

              {deliveryMethod === "other_courier" && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Pickup Address
                    <input
                      className={styles.input}
                      type="text"
                      {...register("pickupAddress")}
                    />
                  </label>
                  {errors.pickupAddress && (
                    <span className={styles.fieldError}>
                      {errors.pickupAddress.message}
                    </span>
                  )}

                  <label className={styles.label}>
                    Drop-off Address
                    <input
                      className={styles.input}
                      type="text"
                      {...register("dropoffAddress")}
                    />
                  </label>
                  {errors.dropoffAddress && (
                    <span className={styles.fieldError}>
                      {errors.dropoffAddress.message}
                    </span>
                  )}
                </div>
              )}
            </div>

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
                  Your Item ({detail.offeredListing.title})
                  <select className={styles.input} {...register("yourCondition")}>
                    <option value="">Select condition</option>
                    {CONDITION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.label}>
                  Their Item ({detail.requestedListing.title})
                  <select
                    className={styles.input}
                    {...register("theirCondition")}
                  >
                    <option value="">Select condition</option>
                    {CONDITION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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