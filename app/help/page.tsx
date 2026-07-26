"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: "Account",
    items: [
      {
        question: "How do I create an account?",
        answer: "You can create an account by visiting the signup page and registering with your email or using Google Sign-In. Follow the prompts to verify your email and set up your profile.",
      },
      {
        question: "How do I edit my profile?",
        answer: "Go to your profile page and tap on 'Edit Profile'. From there, you can update your information, change your profile picture, update your bio, and adjust your location settings.",
      },
      {
        question: "How do I change my profile picture?",
        answer: "Visit your profile page and select 'Edit Profile'. Tap on your current profile picture to upload a new one from your device. You can choose a clear, recognizable image for better trust.",
      },
    ],
  },
  {
    title: "Listings",
    items: [
      {
        question: "How do I create a listing?",
        answer: "Tap the '+' button on the home page to create a new listing. Upload clear photos, add a title and description, set the estimated swap value, and specify what items you're looking for.",
      },
      {
        question: "Can I edit my listing?",
        answer: "Yes, you can edit your listing at any time. Go to your profile, find the listing you want to edit, and tap the edit button. You can update photos, description, and other details.",
      },
      {
        question: "Can I delete my listing?",
        answer: "Yes, you can delete your listing from your profile. Tap on the listing and select the delete option. Once deleted, the listing will no longer be visible to other users.",
      },
    ],
  },
  {
    title: "Swap Requests",
    items: [
      {
        question: "How do swap requests work?",
        answer: "When you send a swap request, it starts as 'Pending'. The other user can then Accept or Decline it. If accepted, it becomes 'Accepted' and moves to 'Completed' when the swap is finished. You can also Cancel a pending request.",
      },
      {
        question: "Can I cancel my request?",
        answer: "Yes, you can cancel your swap request as long as it hasn't been accepted yet. Once the other user accepts your request, you'll need to communicate with them if you want to back out.",
      },
    ],
  },
  {
    title: "Messages",
    items: [
      {
        question: "How do I contact another user?",
        answer: "Messaging is available once you've connected through the swap process. Once a swap request is sent or accepted, you can chat with your swap partner to discuss details and arrange the exchange.",
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        question: "What notifications do I receive?",
        answer: "You'll receive notifications for: new swap requests, when your requests are accepted, when requests are declined, and when requests are cancelled. You can manage notification preferences in your settings.",
      },
    ],
  },
];

function FAQItemComponent({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQuestion} onClick={onToggle}>
        <span>{item.question}</span>
        <ChevronDown
          size={20}
          className={`${styles.chevron} ${isOpen ? styles.open : ""}`}
        />
      </button>
      {isOpen && <div className={styles.faqAnswer}>{item.answer}</div>}
    </div>
  );
}

export default function HelpCenterPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (key: string) => {
    setOpenItems((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <PageHeader title="Help Center" />

        {faqSections.map((section, sectionIndex) => (
          <section key={sectionIndex} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <div className={styles.faqList}>
              {section.items.map((item, itemIndex) => {
                const itemKey = `${sectionIndex}-${itemIndex}`;
                return (
                  <FAQItemComponent
                    key={itemKey}
                    item={item}
                    isOpen={openItems.includes(itemKey)}
                    onToggle={() => toggleItem(itemKey)}
                  />
                );
              })}
            </div>
          </section>
        ))}

        {/* Still Need Help Section */}
        <section className={styles.helpSection}>
          <h2 className={styles.helpTitle}>Still Need Help?</h2>
          <p className={styles.helpText}>
            Can't find the answer you're looking for? Visit our{" "}
            <a href="/contact" className={styles.link}>
              Contact Us
            </a>
            {" "}page to get in touch with our support team. We're here to help!
          </p>
        </section>
      </div>
    </main>
  );
}
