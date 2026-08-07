import styles from "./page.module.css";
import { Mail } from "lucide-react";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function ContactPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <PageHeader title="Contact Us" showBack />

        {/* Introduction */}
        <section className={styles.intro}>
          <p className={styles.introText}>
            We&apos;d love to hear from you! Whether you have questions, feedback, or need support, our team is here to help. Reach out to us using the information below.
          </p>
        </section>

        {/* Support Email */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Support Email</h2>
          <div className={styles.emailCard}>
            <Mail size={32} className={styles.emailIcon} />
            <a href="mailto:support@swapspot.com" className={styles.emailLink}>
              support@swapspot.com
            </a>
          </div>
        </section>

        {/* Response Time */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Response Time</h2>
          <p className={styles.text}>
            We typically respond to inquiries within <strong>24–48 hours</strong>. Please allow extra time during weekends and holidays.
          </p>
        </section>

        {/* Report a Bug */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Report a Bug</h2>
          <p className={styles.text}>
            If you encounter a technical issue, please provide the following information to help us resolve it quickly:
          </p>
          <ul className={styles.list}>
            <li><strong>Device:</strong> What device are you using (phone model, OS)?</li>
            <li><strong>Browser:</strong> Which browser are you using?</li>
            <li><strong>Screenshots:</strong> Include images of the issue if possible</li>
            <li><strong>Steps to Reproduce:</strong> Describe exactly how to recreate the problem</li>
          </ul>
        </section>

        {/* Suggestions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Suggestions & Feedback</h2>
          <p className={styles.text}>
            Have an idea to improve SwapSpot? We love hearing suggestions from our community! Please send us your ideas, and we&apos;ll review them carefully.
          </p>
          <div className={styles.closingMessage}>
            <p>
              <strong>Thank you for helping us improve SwapSpot!</strong> Your feedback is invaluable in making our community better for everyone.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
