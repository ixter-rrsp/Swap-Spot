"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Landing.module.css";

const FAQS = [
  {
    question: "Is SwapSpot free to use?",
    answer:
      "Yes — creating an account, listing items, and swapping is free. Optional paid plans exist for extra features like boosted listings.",
  },
  {
    question: "How do I know a swap is safe?",
    answer:
      "You can check a user's rating, review history, and verification badge before agreeing to a swap, and chat with them directly beforehand.",
  },
  {
    question: "Can I swap for something outside my area?",
    answer:
      "Yes, though many users prefer nearby swaps for easy in-person meetups. You can filter listings by distance to find matches close to you.",
  },
  {
    question: "What happens if the other person doesn't show up?",
    answer:
      "You can cancel the swap agreement and leave a review reflecting your experience, which helps keep the community accountable.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <p className={styles.eyebrow}>FAQ</p>
      <h2 id="faq-heading" className={styles.sectionTitle}>
        Frequently asked questions
      </h2>
      <p className={styles.sectionSubtitle}>
        Can't find what you're looking for? Reach out through our contact
        page.
      </p>

      <div className={styles.faqList}>
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          const answerId = `faq-answer-${index}`;

          return (
            <div className={styles.faqItem} key={faq.question}>
              <button
                type="button"
                className={styles.faqQuestion}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`${styles.faqChevron} ${
                    isOpen ? styles.faqChevronOpen : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <p id={answerId} className={styles.faqAnswer}>
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
