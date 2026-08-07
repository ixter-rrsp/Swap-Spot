"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import styles from "./dashboard.module.css";

interface VerificationUser {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

interface VerificationRequest {
  id: string;
  userId: string;
  idType: "government_id" | "school_id";
  status: "pending" | "approved" | "rejected";
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  idDocumentUrl: string;
  selfieUrl: string;
  user: VerificationUser | null;
}

const ID_TYPE_LABELS: Record<string, string> = {
  government_id: "Government ID",
  school_id: "School ID",
};

const TABS: { value: string; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default function VerificationsPanel() {
  const [tab, setTab] = useState("pending");
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin-jkiqlou9xs16ceb6gya8Ilve1llt/verifications?status=${tab}`);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to load verification requests.");
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load verification requests.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadRequests]);

  async function updateRequest(
    id: string,
    updates: { status?: string; adminNotes?: string }
  ) {
    setSavingId(id);
    try {
      const response = await fetch(`/api/admin-jkiqlou9xs16ceb6gya8Ilve1llt/verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to update verification request.");
      }

      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update verification request.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.value}
            className={t.value === tab ? styles.tabActive : styles.tab}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <p className={styles.empty}>Loading verification requests...</p>
      ) : requests.length === 0 ? (
        <p className={styles.empty}>No verification requests in this category.</p>
      ) : (
        <div className={styles.list}>
          {requests.map((req) => (
            <div key={req.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <span className={styles.badgeStatus} data-status={req.status}>
                    {req.status}
                  </span>
                  <span className={styles.reason}>{ID_TYPE_LABELS[req.idType]}</span>
                </div>
                <span className={styles.date}>
                  {new Date(req.createdAt).toLocaleString()}
                </span>
              </div>

              <div className={styles.parties}>
                <div className={styles.party}>
                  <span className={styles.partyLabel}>Applicant</span>
                  {req.user ? (
                    <Link
                      href={`/profile/${req.user.username}`}
                      target="_blank"
                      className={styles.partyLink}
                    >
                      {req.user.fullName || req.user.username}
                    </Link>
                  ) : (
                    <span>Unknown</span>
                  )}
                  {req.user?.isVerified && (
                    <span className={styles.strikes}>
                      <BadgeCheck size={12} /> currently verified
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.proofRow}>
                {req.idDocumentUrl && (
                  <a
                    href={req.idDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.proofThumb}
                  >
                    <img src={req.idDocumentUrl} alt="ID document" />
                  </a>
                )}
                {req.selfieUrl && (
                  <a
                    href={req.selfieUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.proofThumb}
                  >
                    <img src={req.selfieUrl} alt="Selfie holding ID" />
                  </a>
                )}
              </div>

              <textarea
                className={styles.notes}
                placeholder="Admin notes..."
                defaultValue={req.adminNotes ?? ""}
                onChange={(e) =>
                  setNotesDraft((prev) => ({ ...prev, [req.id]: e.target.value }))
                }
              />

              {req.reviewedBy && (
                <p className={styles.reviewedMeta}>
                  Last actioned by {req.reviewedBy}
                  {req.reviewedAt && ` on ${new Date(req.reviewedAt).toLocaleString()}`}
                </p>
              )}

              <div className={styles.actions}>
                <button
                  className={styles.saveNotes}
                  disabled={savingId === req.id}
                  onClick={() =>
                    updateRequest(req.id, {
                      adminNotes: notesDraft[req.id] ?? req.adminNotes ?? "",
                    })
                  }
                >
                  Save Notes
                </button>

                {req.status !== "approved" && (
                  <button
                    className={styles.resolveBtn}
                    disabled={savingId === req.id}
                    onClick={() => updateRequest(req.id, { status: "approved" })}
                  >
                    Approve
                  </button>
                )}
                {req.status !== "rejected" && (
                  <button
                    className={styles.dismissBtn}
                    disabled={savingId === req.id}
                    onClick={() => updateRequest(req.id, { status: "rejected" })}
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
