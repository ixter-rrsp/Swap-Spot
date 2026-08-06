import Link from "next/link";
import styles from "./Landing.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span className={styles.footerLogo}>
          Swap<span>Spot</span>
        </span>

        <ul className={styles.footerLinks}>
          <li>
            <Link href="/how-it-works">How It Works</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
          <li>
            <Link href="/terms">Terms</Link>
          </li>
          <li>
            <Link href="/privacy">Privacy</Link>
          </li>
        </ul>

        <p className={styles.footerCopyright}>
          &copy; {new Date().getFullYear()} SwapSpot. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
