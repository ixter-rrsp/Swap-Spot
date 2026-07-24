import styles from "./HomeHeader.module.css";
import icon from '../../../../public/src/icon.png'; // or wherever it is

export default function HomeHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div>
          <div>
<img src={icon.src} alt="Icon" style={{ width: '180px', height: '50px' }}
/>
          </div>
          <p className={styles.tagline}>Your spot to <br /> swap.</p>
        </div>


          <button
            type="button"
            className={styles.avatarButton}
            aria-label="Profile"
          >
            <img src="/src/karina.jpg" alt="Profile" />
          </button>
        </div>
    </header>
  );
}