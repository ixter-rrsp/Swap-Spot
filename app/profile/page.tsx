import Navbar from "../components/Layout/Navbar/Navbar";
import styles from "./page.module.css";

export default function ProfilePage() {
  const statusItems = ["To confirm", "To exchange", "To receive", "To rate"];

  return (
    <>
      <div className={styles.container}>
        <header className={styles.profileHeader}>
          <div className={styles.profileHeaderLeft}>
            <div className={styles.avatar}>
              <span>PM</span>
            </div>
            <div>
              <h2 className={styles.profileName}>p_mncda</h2>
              <p className={styles.profileBadge}>Member</p>
            </div>
          </div>
          <button className={styles.settingsBtn}>⚙️</button>
        </header>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>20</span>
            <span className={styles.statLabel}>of 20</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>20</span>
            <span className={styles.statLabel}>Finished transactions</span>
          </div>
        </div>
        <p className={styles.statsSub}>Tracked over the last 3 months</p>

        <div className={styles.statusGrid}>
          {statusItems.map((label, i) => (
            <div key={i} className={styles.statusItem}>
              <div className={styles.statusCircle} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span>To confirm</span>
            <span>To verify</span>
            <span>Completed</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: "33%" }} />
          </div>
        </div>

        <div className={styles.tabsRow}>
          <button className={`${styles.tabBtn} ${styles.activeTab}`}>My Offers</button>
          <button className={styles.tabBtn}>Received Offers</button>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent offers</h3>
            <button className={styles.seeAll}>See all</button>
          </div>
          <div className={styles.offerList}>
            <div className={styles.offerItem}>
              <div className={styles.offerIcon}>👶</div>
              <span>Baby clothes</span>
            </div>
            <div className={styles.offerItem}>
              <div className={styles.offerIcon}>👞</div>
              <span>Leather shoes</span>
            </div>
            <div className={styles.offerItem}>
              <div className={styles.offerIcon}>👔</div>
              <span>School uniform</span>
            </div>
          </div>
        </section>
      </div>
      <Navbar />
    </>
  );
}