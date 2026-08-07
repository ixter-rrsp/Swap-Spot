"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./ReportUserModal.module.css";

interface ReportUserModalProps {
  reportedUserId: string;
  reportedUsername: string;
  onClose: () => void;
}

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: "scam_fraud_fake_swap", label: "Scam / Fraud / Fake Swap" },
  { value: "misleading_item_details", label: "Misleading Item Details" },
  { value: "harassment_rude_behavior", label: "Harassment / Rude Behavior" },
  { value: "fake_stolen_photos", label: "Fake / Stolen Photos" },
  { value: "spam_unrelated_posts", label: "Spam / Unrelated Posts" },
  { value: "violates_swapspot_rules", label: "Violates SwapSpot Rules" },
  { value: "other", label: "Other (write below)" },
];

export default function ReportUserModal({
  reportedUserId,
  reportedUsername,
  onClose,
}: ReportUserModalProps) {
  const router = useRouter();

  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 3);
    setFiles(selected);
  }

  async function handleSubmit() {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    if (reason === "other" && !description.trim()) {
      setError("Please describe the issue.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("reportedUserId", reportedUserId);
      formData.append("reason", reason);
      formData.append("description", description);
      files.forEach((file) => formData.append("proof", file));

      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to submit report.");
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        {submitted ? (
          <div className={styles.confirmation}>
            <h2 className={styles.title}>Report Sent</h2>
            <p className={styles.confirmationText}>
              We will review your report within 2–3 working days. Your
              identity will not be shared with the user you reported. Thank
              you!
            </p>
            <button className={styles.submit} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className={styles.title}>Report {reportedUsername}</h2>
            <p className={styles.subtitle}>Why are you reporting this user?</p>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.reasonList}>
              {REASON_OPTIONS.map((option) => (
                <label key={option.value} className={styles.reasonItem}>
                  <input
                    type="radio"
                    name="report-reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => {
                      setReason(option.value);
                      setError(null);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <label className={styles.fieldLabel}>
              Add Proof: Screenshots / Photos (optional, up to 3)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className={styles.fileInput}
            />

            <label className={styles.fieldLabel}>
              Short Description / Explanation
              {reason === "other" && " (required)"}
            </label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what happened..."
              rows={4}
            />

            <button
              className={styles.submit}
              disabled={submitting || !reason}
              onClick={handleSubmit}
            >
              {submitting ? "Sending..." : "Send Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
