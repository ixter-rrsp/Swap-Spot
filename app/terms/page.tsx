import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function TermsPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <PageHeader title="Terms &amp; Conditions" showBack />
        <p className={styles.lastUpdated}>Last updated: July 2026</p>

        {/* Acceptance of Terms */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
          <p className={styles.text}>
            By accessing and using SwapSpot, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you are not permitted to use this platform.
          </p>
        </section>

        {/* User Responsibilities */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>User Responsibilities</h2>
          <p className={styles.text}>By using SwapSpot, you agree to:</p>
          <ul className={styles.list}>
            <li>Provide truthful and accurate information</li>
            <li>Respect all other users and maintain professional communication</li>
            <li>Keep your account credentials secure and confidential</li>
            <li>Follow all platform rules and community guidelines</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        {/* Listings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Listings</h2>
          <p className={styles.text}>
            All listings must comply with SwapSpot policies. Listings must not contain:
          </p>
          <ul className={styles.list}>
            <li>Illegal goods or services</li>
            <li>Counterfeit or replica products</li>
            <li>Dangerous, hazardous, or prohibited items</li>
            <li>Offensive, abusive, or inappropriate content</li>
            <li>Fraudulent or misleading information</li>
          </ul>
          <p className={styles.text}>
            Violation of these guidelines may result in listing removal and account suspension.
          </p>
        </section>

        {/* Swaps */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Swaps</h2>
          <p className={styles.text}>
            SwapSpot facilitates connections between users but is not responsible for:
          </p>
          <ul className={styles.list}>
            <li>The quality or condition of items traded</li>
            <li>The legality of transactions between users</li>
            <li>The outcome or success of any swap</li>
            <li>Disputes between users</li>
            <li>Loss or damage that occurs during trades</li>
          </ul>
          <p className={styles.text}>
            Users are solely responsible for evaluating items and ensuring fair trades.
          </p>
        </section>

        {/* Account Suspension */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account Suspension & Termination</h2>
          <p className={styles.text}>
            SwapSpot reserves the right to suspend or permanently remove accounts for:
          </p>
          <ul className={styles.list}>
            <li>Fraudulent activity or scamming</li>
            <li>Abuse or harassment of other users</li>
            <li>Repeated violations of these terms</li>
            <li>Posting prohibited content</li>
            <li>Violating community rules and guidelines</li>
          </ul>
        </section>

        {/* Disclaimer */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Disclaimer</h2>
          <p className={styles.text}>
            SwapSpot is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any listings or user information.
          </p>
        </section>
      </div>
    </main>
  );
}
