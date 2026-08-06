import styles from "./Landing.module.css";
import Reveal from "./Reveal";

const STEPS = [
  {
    number: "1",
    title: "List an item",
    description: "Post something you no longer need, with a few photos and details.",
  },
  {
    number: "2",
    title: "Find a match",
    description: "Browse listings and propose a swap for something you'd rather have.",
  },
  {
    number: "3",
    title: "Meet & swap",
    description: "Chat, agree on the details, and complete the exchange safely.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={styles.section}
      aria-labelledby="how-it-works-heading"
    >
      <Reveal variant="up">
        <p className={styles.eyebrow}>How It Works</p>
        <h2 id="how-it-works-heading" className={styles.sectionTitle}>
          Three steps to your next swap
        </h2>
        <p className={styles.sectionSubtitle}>
          No listings fees, no shipping payments to hold — just a straightforward
          way to trade.
        </p>
      </Reveal>

      <div className={styles.stepsGrid}>
        {STEPS.map((step, index) => (
          <Reveal variant="left" delay={index * 120} key={step.number}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
