import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function TrustAndSafetyPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <PageHeader title="Trust & Safety" />
        <p className={styles.subtitle}>Learn how to trade safely on SwapSpot</p>

        {/* Meet in Public Places */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Meet in Public Places</h2>
          <p className={styles.sectionDescription}>
            Always meet your swap partner in a safe, busy public location. Recommended meeting places include:
          </p>
          <ul className={styles.list}>
            <li>Shopping malls</li>
            <li>Coffee shops</li>
            <li>School campuses</li>
            <li>Police stations</li>
            <li>Other busy public places</li>
          </ul>
          <p className={styles.warning}>
            ⚠️ Never meet in private or isolated locations. Your safety is our priority.
          </p>
        </section>

        {/* Inspect Items Carefully */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Inspect Items Carefully</h2>
          <p className={styles.sectionDescription}>
            Before completing any swap, take time to thoroughly examine both items:
          </p>
          <ul className={styles.list}>
            <li>Check the item's overall condition</li>
            <li>Verify functionality and test if possible</li>
            <li>Ask questions about any concerns</li>
            <li>Look for damage or defects</li>
            <li>Compare items to their listing descriptions</li>
          </ul>
        </section>

        {/* Protect Your Personal Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Protect Your Personal Information</h2>
          <p className={styles.sectionDescription}>
            Keep your personal information secure. Never share:
          </p>
          <ul className={styles.list}>
            <li>Your home address</li>
            <li>Your passwords</li>
            <li>Banking or payment information</li>
            <li>One-time passwords (OTP) or verification codes</li>
            <li>Sensitive personal information</li>
          </ul>
        </section>

        {/* Beware of Scams */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Beware of Scams</h2>
          <p className={styles.sectionDescription}>
            Be cautious of suspicious activity, including:
          </p>
          <ul className={styles.list}>
            <li>Requests for advance payments</li>
            <li>Suspicious links or unusual messages</li>
            <li>Fake or misleading listings</li>
            <li>Pressure tactics or urgency</li>
            <li>Requests to communicate outside the platform immediately</li>
          </ul>
          <p className={styles.tip}>
            💡 Tip: If something feels off, trust your instincts and report it.
          </p>
        </section>

        {/* Report Suspicious Activity */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Report Suspicious Activity</h2>
          <p className={styles.sectionDescription}>
            Help keep our community safe by reporting users who:
          </p>
          <ul className={styles.list}>
            <li>Attempt to scam or defraud others</li>
            <li>Harass or threaten other users</li>
            <li>Upload prohibited or offensive content</li>
            <li>Violate community rules or guidelines</li>
          </ul>
          <p className={styles.sectionDescription}>
            Use the report feature on any listing or profile to notify our moderation team.
          </p>
        </section>
      </div>
    </main>
  );
}
