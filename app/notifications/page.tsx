import Navbar from "../components/Layout/Navbar/Navbar";
import styles from "./page.module.css";

export default function NotificationsPage() {
  const notifications = [
    {
      type: "shop",
      title: "You've received a boost coupon",
      desc: "Tap here for details on your swap boost",
      time: "1h",
      unread: false,
      count: 0, // added
    },
    {
      type: "shop",
      title: "Boost coupon reminder",
      desc: "Your coupon expires soon",
      time: "6d",
      unread: false,
      count: 0, // added
    },
    {
      type: "message",
      initials: "LS",
      name: "Lucky Stationery",
      message: "Hello po, I'm Fiona, your swap partner...",
      time: "20h",
      count: 8,
      unread: true,
    },
    {
      type: "message",
      initials: "FK",
      name: "FunKey Home",
      message: "Everyone's loving these swaps!",
      time: "2d",
      count: 5,
      unread: true,
    },
    {
      type: "message",
      initials: "KP",
      name: "Kiki Pet Store",
      message: "Did you forget something?",
      time: "1w",
      count: 0,
      unread: false,
    },
  ];

  return (
    <>
      <div className={styles.container}>
        <header className={styles.notifHeader}>
          <h2>Notifications</h2>
          <button className={styles.markAll}>Mark all read</button>
        </header>

        <div className={styles.notifList}>
          <div className={styles.notifSection}>
            <h3 className={styles.notifSectionTitle}>SHOP UPDATES</h3>
            {notifications.filter(n => n.type === "shop").map((n, i) => (
              <div key={i} className={styles.notifItem}>
                <div className={styles.notifContent}>
                  <div className={styles.notifIcon}>🏪</div>
                  <div>
                    <p className={styles.notifTitle}>{n.title}</p>
                    <p className={styles.notifDesc}>{n.desc}</p>
                  </div>
                </div>
                <span className={styles.notifTime}>{n.time}</span>
              </div>
            ))}
          </div>

          <div className={styles.notifSection}>
            <h3 className={styles.notifSectionTitle}>MESSAGES</h3>
            {notifications.filter(n => n.type === "message").map((n, i) => (
              <div key={i} className={styles.notifItem}>
                <div className={styles.notifContent}>
                  <div className={styles.messageAvatar}>
                    {n.initials}
                    {n.unread && <span className={styles.unreadDot} />}
                  </div>
                  <div>
                    <p className={styles.notifTitle}>{n.name}</p>
                    <p className={styles.notifDesc}>{n.message}</p>
                  </div>
                </div>
                <div className={styles.notifRight}>
                  <span className={styles.notifTime}>{n.time}</span>
                  {n.count > 0 && <span className={styles.notifBadge}>{n.count}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.unsentMsg}>
            <span>Rene Baterbonia unsent a message</span>
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
}