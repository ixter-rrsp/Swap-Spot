import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function PrivacyPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <PageHeader title="Privacy Policy" />
        <p className={styles.lastUpdated}>Last updated: July 2026</p>

        {/* Information We Collect */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Information We Collect</h2>
          <p className={styles.text}>
            SwapSpot collects the following information to provide and improve our services:
          </p>
          <ul className={styles.list}>
            <li>Your name and email address</li>
            <li>Your profile photo and biographical information</li>
            <li>Item listings and descriptions</li>
            <li>Messages and communications with other users</li>
            <li>Location information for nearby listings</li>
            <li>Account preferences and settings</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
          <p className={styles.text}>
            We use your information to:
          </p>
          <ul className={styles.list}>
            <li>Authenticate your account and verify your identity</li>
            <li>Display your listings to other users</li>
            <li>Match you with nearby users based on location</li>
            <li>Send notifications about swap requests and messages</li>
            <li>Improve platform functionality and user experience</li>
            <li>Prevent fraud and ensure account security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        {/* Location Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Location Information</h2>
          <p className={styles.text}>
            Location data is used to provide nearby listings and improve your SwapSpot experience. SwapSpot takes user privacy seriously and only displays location information according to the application's design and privacy settings. You have control over what location information is shared.
          </p>
        </section>

        {/* Data Protection */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Protection</h2>
          <p className={styles.text}>
            SwapSpot implements reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption and secure servers to safeguard your data.
          </p>
        </section>

        {/* Data Sharing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Sharing</h2>
          <p className={styles.text}>
            <strong>SwapSpot does not sell your personal information to third parties.</strong> Your data is never sold, rented, or shared with external companies for marketing purposes.
          </p>
          <p className={styles.text}>
            We may share information with:
          </p>
          <ul className={styles.list}>
            <li>Service providers who help us operate SwapSpot</li>
            <li>Legal authorities when required by law</li>
            <li>Other users (only the information you choose to share)</li>
          </ul>
        </section>

        {/* Your Rights */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Rights</h2>
          <p className={styles.text}>
            You have the right to:
          </p>
          <ul className={styles.list}>
            <li>Access your personal information</li>
            <li>Update or correct your information</li>
            <li>Request deletion of your account and data</li>
            <li>Opt-out of promotional communications</li>
          </ul>
        </section>

        {/* Contact Us */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Us</h2>
          <p className={styles.text}>
            If you have questions about this Privacy Policy or our data practices, please contact us at{" "}
            <a href="mailto:support@swapspot.com" className={styles.link}>
              support@swapspot.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
