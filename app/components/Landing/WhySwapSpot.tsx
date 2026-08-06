import { Leaf, Wallet, Users } from "lucide-react";
import styles from "./Landing.module.css";
import Reveal from "./Reveal";

const REASONS = [
  {
    icon: Leaf,
    title: "Reduce waste",
    description:
      "Give items a second life instead of letting them pile up unused or ending up in a landfill.",
  },
  {
    icon: Wallet,
    title: "No cash needed",
    description:
      "Trade directly for what you actually want — no selling, no buying, no price haggling.",
  },
  {
    icon: Users,
    title: "Real people, real trust",
    description:
      "Ratings, reviews, and verified profiles help you swap with confidence every time.",
  },
];

export default function WhySwapSpot() {
  return (
    <section
      id="why"
      className={`${styles.section} ${styles.sectionAlt}`}
      aria-labelledby="why-heading"
    >
      <Reveal variant="up">
        <p className={styles.eyebrow}>Why SwapSpot</p>
        <h2 id="why-heading" className={styles.sectionTitle}>
          A better way to get what you need
        </h2>
        <p className={styles.sectionSubtitle}>
          SwapSpot connects people who have what you want with people who want
          what you have — no money changes hands.
        </p>
      </Reveal>

      <div className={styles.whyGrid}>
        {REASONS.map((reason, index) => (
          <Reveal variant="up" delay={index * 100} key={reason.title}>
            <div className={styles.whyCard}>
              <div className={styles.whyIconWrap}>
                <reason.icon size={22} aria-hidden="true" />
              </div>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
