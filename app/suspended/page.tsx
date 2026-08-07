import Link from "next/link";

import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";

export default async function SuspendedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let reason: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("suspension_reason, suspension_status")
      .eq("id", user.id)
      .maybeSingle();

    // If they're not actually hard-suspended (anymore), don't strand them
    // here — send them home.
    if (profile?.suspension_status !== "hard") {
      reason = null;
    } else {
      reason = profile.suspension_reason ?? null;
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <span className={styles.badge}>Account suspended</span>
        <h1 className={styles.title}>This account has been suspended</h1>
        <p className={styles.body}>
          Access has been restricted by SwapSpot's trust &amp; safety team.
          You won't be able to browse, message, or manage listings while this
          is in effect.
        </p>

        {reason && <p className={styles.reason}>{reason}</p>}

        <p className={styles.body}>
          If you think this is a mistake, reach out and we'll take a look.
        </p>

        <div className={styles.actions}>
          <Link href="/contact" className={`${styles.link} ${styles.primary}`}>
            Contact support
          </Link>
          <Link href="/login" className={`${styles.link} ${styles.secondary}`}>
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
