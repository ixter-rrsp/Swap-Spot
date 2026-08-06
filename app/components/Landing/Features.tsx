import { MessageCircle, ShieldCheck, MapPin, Star } from "lucide-react";
import styles from "./Landing.module.css";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Built-in chat",
    description: "Message the other person directly to work out the details of your swap.",
  },
  {
    icon: ShieldCheck,
    title: "Verified profiles",
    description: "Optional identity verification helps you know who you're swapping with.",
  },
  {
    icon: MapPin,
    title: "Local & nearby",
    description: "Filter listings by distance so meetups stay convenient.",
  },
  {
    icon: Star,
    title: "Ratings & reviews",
    description: "Build a reputation over time as a reliable trading partner.",
  },
];

export default function Features() {
  return (
    <section
      className={`${styles.section} ${styles.sectionAlt}`}
      aria-labelledby="features-heading"
    >
      <p className={styles.eyebrow}>Features</p>
      <h2 id="features-heading" className={styles.sectionTitle}>
        Everything you need to swap with confidence
      </h2>
      <p className={styles.sectionSubtitle}>
        SwapSpot handles the logistics so you can focus on finding a good
        trade.
      </p>

      <div className={styles.featuresGrid}>
        {FEATURES.map((feature) => (
          <div className={styles.featureItem} key={feature.title}>
            <div className={styles.featureIconWrap}>
              <feature.icon size={20} aria-hidden="true" />
            </div>
            <div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
