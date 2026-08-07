"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import VerificationsPanel from "./VerificationsPanel";

import styles from "./dashboard.module.css";

interface ProfileRef {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  badge?: string;
  report_strikes?: number;
}

interface Report {
  id: string;
  reason: string;
  description: string | null;
  proof_urls: string[];
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter: ProfileRef | null;
  reported: ProfileRef | null;
}

const REASON_LABELS: Record<string, string> = {
  scam_fraud_fake_swap: "Scam / Fraud / Fake Swap",
  misleading_item_details: "Misleading Item Details",
  harassment_rude_behavior: "Harassment / Rude Behavior",
  fake_stolen_photos: "Fake / Stolen Photos",
  spam_unrelated_posts: "Spam / Unrelated Posts",
  violates_swapspot_rules: "Violates SwapSpot Rules",
  other: "Other",
};

const TABS: { value: string; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
  { value: "all", label: "All" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [section, setSection] = useState<"reports" | "verifications">("reports");
  const [tab, setTab] = useState("pending");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin-x9k2p/reports?status=${tab}`);

      if (response.status === 401) {
        router.push("/admin-x9k2p");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to load reports.");
      }

      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [tab, router]);

  useEffect(() => {
    if (section === "reports") {
      void loadReports();
    }
  }, [loadReports, section]);

  async function updateReport(
    id: string,
    updates: { status?: string; adminNotes?: string }
  ) {
    setSavingId(id);
    try {
      const response = await fetch(`/api/admin-x9k2p/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to update report.");
      }

      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin-x9k2p/logout", { method: "POST" });
    router.push("/admin-x9k2p");
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <button className={styles.logout} onClick={handleLogout}>
          Log out
        </button>
      </header>

      <div className={styles.tabs}>
        <button
          className={section === "reports" ? styles.tabActive : styles.tab}
          onClick={() => setSection("reports")}
        >
          Report Review
        </button>
        <button
          className={section === "verifications" ? styles.tabActive : styles.tab}
          onClick={() => setSection("verifications")}
        >
          Account Verification
        </button>
      </div>

      {section === "verifications" ? (
        <VerificationsPanel />
      ) : (
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
        <p className={styles.empty}>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className={styles.empty}>No reports in this category.</p>
      ) : (
        <div className={styles.list}>
          {reports.map((report) => (
            <div key={report.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <span className={styles.badgeStatus} data-status={report.status}>
                    {report.status}
                  </span>
                  <span className={styles.reason}>
                    {REASON_LABELS[report.reason] || report.reason}
                  </span>
                </div>
                <span className={styles.date}>
                  {new Date(report.created_at).toLocaleString()}
                </span>
              </div>

              <div className={styles.parties}>
                <div className={styles.party}>
                  <span className={styles.partyLabel}>Reported by</span>
                  {report.reporter ? (
                    <Link
                      href={`/profile/${report.reporter.username}`}
                      target="_blank"
                      className={styles.partyLink}
                    >
                      {report.reporter.full_name || report.reporter.username}
                    </Link>
                  ) : (
                    <span>Unknown</span>
                  )}
                </div>
                <div className={styles.party}>
                  <span className={styles.partyLabel}>Reported user</span>
                  {report.reported ? (
                    <Link
                      href={`/profile/${report.reported.username}`}
                      target="_blank"
                      className={styles.partyLink}
                    >
                      {report.reported.full_name || report.reported.username}
                    </Link>
                  ) : (
                    <span>Unknown</span>
                  )}
                  {typeof report.reported?.report_strikes === "number" && (
                    <span
                      className={styles.strikes}
                      data-warn={report.reported.report_strikes >= 3}
                    >
                      {report.reported.report_strikes} strike
                      {report.reported.report_strikes === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </div>

              {report.description && (
                <p className={styles.description}>{report.description}</p>
              )}

              {report.proof_urls?.length > 0 && (
                <div className={styles.proofRow}>
                  {report.proof_urls.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.proofThumb}
                    >
                      <img src={url} alt="Proof" />
                    </a>
                  ))}
                </div>
              )}

              <textarea
                className={styles.notes}
                placeholder="Admin notes..."
                defaultValue={report.admin_notes ?? ""}
                onChange={(e) =>
                  setNotesDraft((prev) => ({ ...prev, [report.id]: e.target.value }))
                }
              />

              {report.reviewed_by && (
                <p className={styles.reviewedMeta}>
                  Last actioned by {report.reviewed_by}
                  {report.reviewed_at &&
                    ` on ${new Date(report.reviewed_at).toLocaleString()}`}
                </p>
              )}

              <div className={styles.actions}>
                <button
                  className={styles.saveNotes}
                  disabled={savingId === report.id}
                  onClick={() =>
                    updateReport(report.id, {
                      adminNotes: notesDraft[report.id] ?? report.admin_notes ?? "",
                    })
                  }
                >
                  Save Notes
                </button>

                {report.status !== "reviewing" && (
                  <button
                    className={styles.actionBtn}
                    disabled={savingId === report.id}
                    onClick={() => updateReport(report.id, { status: "reviewing" })}
                  >
                    Mark Reviewing
                  </button>
                )}
                {report.status !== "resolved" && (
                  <button
                    className={styles.resolveBtn}
                    disabled={savingId === report.id}
                    onClick={() => updateReport(report.id, { status: "resolved" })}
                  >
                    Resolve
                  </button>
                )}
                {report.status !== "dismissed" && (
                  <button
                    className={styles.dismissBtn}
                    disabled={savingId === report.id}
                    onClick={() => updateReport(report.id, { status: "dismissed" })}
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </main>
  );
}
