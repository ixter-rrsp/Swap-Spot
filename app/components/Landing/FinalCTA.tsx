import Link from "next/link";
import styles from "./Landing.module.css";
import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section aria-labelledby="final-cta-heading">
      <Reveal variant="scale">
        <div className={styles.finalCta}>
          <h2 id="final-cta-heading">Ready to make your first swap?</h2>
          <p>Join SwapSpot today — it only takes a minute to get started.</p>
          <Link href="/signup" className={styles.finalCtaButton}>
            Get Started for Free
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
