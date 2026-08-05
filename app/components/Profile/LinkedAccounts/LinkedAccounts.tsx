"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./LinkedAccounts.module.css";

export default function LinkedAccounts() {
  const [hasGoogle, setHasGoogle] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUserIdentities().then(({ data, error: fetchError }) => {
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setHasGoogle(
        !!data?.identities?.some((identity) => identity.provider === "google")
      );
    });
  }, []);

  async function handleLinkGoogle() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    // Requires "Manual linking" to be enabled in the Supabase dashboard
    // (Authentication settings) — without it, this call fails even for a
    // logged-in user. This is what lets someone who originally signed up
    // with email/password proactively attach a Google identity to their
    // EXISTING account, so a future "Sign in with Google" recognizes them
    // instead of creating a second, separate account.
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "google",
    });

    if (linkError) {
      setError(linkError.message);
      setLoading(false);
    }
    // On success, Supabase redirects to Google and back — no further
    // action needed here.
  }

  if (hasGoogle === null) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Linked Accounts</h3>
      <p className={styles.description}>
        Link your Google account so you can also sign in with Google using
        this same account, instead of accidentally creating a new one.
      </p>

      {hasGoogle ? (
        <p className={styles.linked}>✓ Google account linked</p>
      ) : (
        <button
          type="button"
          className={styles.linkButton}
          onClick={handleLinkGoogle}
          disabled={loading}
        >
          {loading ? "Redirecting to Google..." : "Link Google Account"}
        </button>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
