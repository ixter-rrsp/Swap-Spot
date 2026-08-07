"use client";

import { useState } from "react";

import UploadTile from "../../UI/UploadTile/UploadTile";
import styles from "./VerifyAccountModal.module.css";

interface VerifyAccountModalProps {
  onClose: () => void;
  onSubmitted: () => void;
}

const ID_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "government_id", label: "Government ID" },
  { value: "school_id", label: "School ID" },
];

export default function VerifyAccountModal({
  onClose,
  onSubmitted,
}: VerifyAccountModalProps) {
  const [idType, setIdType] = useState<string>("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!idType) {
      setError("Please select an ID type.");
      return;
    }
    if (!idDocument) {
      setError("Please upload a photo of your ID.");
      return;
    }
    if (!selfie) {
      setError("Please upload a selfie holding your ID.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("idType", idType);
      formData.append("idDocument", idDocument);
      formData.append("selfie", selfie);

      const response = await fetch("/api/verification", {
        method: "POST",
        body: formData,
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || "Failed to submit verification request.");
      }

      setSubmitted(true);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit verification request.");
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
            <h2 className={styles.title}>Submitted for Review</h2>
            <p className={styles.confirmationText}>
              Thanks! Our team will review your documents within 2–3
              working days. You'll get a verified badge on your profile
              once it's approved.
            </p>
            <button className={styles.submit} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className={styles.title}>Verify Your Account</h2>
            <p className={styles.subtitle}>
              Upload a government or school ID, plus a selfie of yourself
              holding that same ID. This is only used to review your
              identity and won't be shown publicly.
            </p>

            {error && <div className={styles.error}>{error}</div>}

            <label className={styles.fieldLabel}>ID Type</label>
            <div className={styles.reasonList}>
              {ID_TYPE_OPTIONS.map((option) => (
                <label key={option.value} className={styles.reasonItem}>
                  <input
                    type="radio"
                    name="id-type"
                    value={option.value}
                    checked={idType === option.value}
                    onChange={() => {
                      setIdType(option.value);
                      setError(null);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <label className={styles.fieldLabel}>
              Photo of your ID (front, clearly legible)
            </label>
            <div className={styles.uploadGrid}>
              <UploadTile
                id="verify-id-document"
                file={idDocument}
                onChange={setIdDocument}
              />
            </div>

            <label className={styles.fieldLabel}>
              Selfie of you holding that ID
            </label>
            <div className={styles.uploadGrid}>
              <UploadTile id="verify-selfie" file={selfie} onChange={setSelfie} />
            </div>

            <button
              className={styles.submit}
              disabled={submitting || !idType || !idDocument || !selfie}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
