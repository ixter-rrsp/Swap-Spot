import styles from "./HomeHeader.module.css";

export default function HomeHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.logo}>
            <span className={styles.logoGreen}>SWAP</span>SPOT
          </h1>
          <p className={styles.tagline}>Your spot to <br /> swap.</p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Notifications"
          >
            🔔
          </button>

          <button
            type="button"
            className={styles.avatarButton}
            aria-label="Profile"
          >
            <img src="/src/karina.jpg" alt="Profile" />
          </button>
        </div>
      </div>
    </header>
  );
}