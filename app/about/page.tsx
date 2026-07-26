import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <PageHeader title="About SwapSpot" />

        {/* Introduction */}
        <section className={styles.section}>
          <p className={styles.introText}>
            SwapSpot is a community-driven barter marketplace that allows people to exchange items without using money. Instead of throwing away things that are still useful, users can list them for trade and connect with others looking for similar items.
          </p>
          <p className={styles.introText}>
            Our mission is to encourage sustainable living, reduce waste, and make item trading more accessible and convenient.
          </p>
        </section>

        {/* Our Mission */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <ul className={styles.list}>
            <li>Promote sustainable trading</li>
            <li>Encourage item reuse instead of disposal</li>
            <li>Help users save money through bartering</li>
            <li>Build a trustworthy swapping community</li>
          </ul>
        </section>

        {/* What Users Can Do */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What Users Can Do</h2>
          <div className={styles.featureList}>
            <div className={styles.feature}>
              <h3>Create listings</h3>
              <p>Post items you want to trade with detailed descriptions and photos.</p>
            </div>
            <div className={styles.feature}>
              <h3>Upload multiple photos</h3>
              <p>Share clear images of your items from different angles.</p>
            </div>
            <div className={styles.feature}>
              <h3>Discover nearby listings</h3>
              <p>Browse items available in your area based on your location.</p>
            </div>
            <div className={styles.feature}>
              <h3>Send swap requests</h3>
              <p>Propose trades to other users and negotiate details.</p>
            </div>
            <div className={styles.feature}>
              <h3>Receive swap requests</h3>
              <p>Review offers from interested traders and respond accordingly.</p>
            </div>
            <div className={styles.feature}>
              <h3>Chat with other users</h3>
              <p>Communicate securely through the platform's messaging system.</p>
            </div>
            <div className={styles.feature}>
              <h3>Accept or decline offers</h3>
              <p>Manage your swap requests with full control.</p>
            </div>
            <div className={styles.feature}>
              <h3>Manage notifications</h3>
              <p>Stay updated on requests, messages, and platform activity.</p>
            </div>
            <div className={styles.feature}>
              <h3>Track active swaps</h3>
              <p>Monitor the status of your ongoing trades and transactions.</p>
            </div>
          </div>
        </section>

        {/* Community Values */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Community Values</h2>
          <div className={styles.valuesList}>
            <div className={styles.value}>
              <h3>Respect</h3>
              <p>We treat all community members with dignity and courtesy.</p>
            </div>
            <div className={styles.value}>
              <h3>Honesty</h3>
              <p>Accurate listings and transparent communication build trust.</p>
            </div>
            <div className={styles.value}>
              <h3>Fair Trading</h3>
              <p>Equitable exchanges that benefit both parties.</p>
            </div>
            <div className={styles.value}>
              <h3>Transparency</h3>
              <p>Clear terms, policies, and open communication channels.</p>
            </div>
            <div className={styles.value}>
              <h3>Safety</h3>
              <p>A secure environment for all our users to trade with confidence.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
