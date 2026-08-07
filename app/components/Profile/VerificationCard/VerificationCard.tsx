"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Clock, XCircle } from "lucide-react";

import VerifyAccountModal from "@/app/components/Profile/VerifyAccountModal/VerifyAccountModal";

import styles from "./VerificationCard.module.css";

type Status = "pending" | "approved" | "rejected" | null;

interface VerificationCardProps {
  isVerified: boolean;
}

export default function VerificationCard({ isVerified }: VerificationCardProps) {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      try {
        const res = await fetch("/api/verification");
        if (res.ok && active) {
          const data = await res.json();
          setStatus(data.request?.status ?? null);
        }
      } catch {
        // keep default state on error
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStatus();
    return () => {
      active = false;
    };
  }, []);

  function handleSubmitted() {
    setStatus("pending");
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Account Verification</h3>

      {isVerified ? (
        <p className={styles.verified}>
          <BadgeCheck size={16} />
          Your account is verified
        </p>
      ) : loading ? null : status === "pending" ? (
        <>
          <p className={styles.pending}>
            <Clock size={16} />
            Your verification is under review
          </p>
          <p className={styles.description}>
            We'll notify you once it's been reviewed. This usually takes
            2–3 working days.
          </p>
        </>
      ) : (
        <>
          {status === "rejected" && (
            <p className={styles.rejected}>
              <XCircle size={16} />
              Your last submission wasn't approved
            </p>
          )}
          <p className={styles.description}>
            Verify your account with a government or school ID and a
            selfie to get a verified badge on your profile.
          </p>
          <button
            type="button"
            className={styles.verifyButton}
            onClick={() => setModalOpen(true)}
          >
            {status === "rejected" ? "Resubmit for Verification" : "Verify Account"}
          </button>
        </>
      )}

      {modalOpen && (
        <VerifyAccountModal
          onClose={() => setModalOpen(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
}
