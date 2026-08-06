import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import Navbar from "@/app/components/Layout/Navbar/Navbar";

export default function HowItWorksPage() {
  return (
    <>
      <main className={styles.container}>
        <div className={styles.content}>
          <PageHeader title="How SwapSpot Works" showBack align="center" />
          <p className={styles.subtitle}>A step-by-step guide to trading on SwapSpot</p>

        {/* Step 1 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>1</div>
            <h2 className={styles.stepTitle}>Create an Account</h2>
          </div>
          <p className={styles.stepContent}>
            Start by registering using your email or Google Sign-In. An account is required before you can access the marketplace and start trading. Creating an account is quick, easy, and free.
          </p>
        </section>

        {/* Step 2 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>2</div>
            <h2 className={styles.stepTitle}>Complete Your Profile</h2>
          </div>
          <p className={styles.stepContent}>
            Upload a profile picture, add your name, set your city, and configure your swap radius. This information helps improve the swapping experience by connecting you with nearby traders and relevant listings.
          </p>
        </section>

        {/* Step 3 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>3</div>
            <h2 className={styles.stepTitle}>Post Your Listing</h2>
          </div>
          <p className={styles.stepContent}>
            Upload clear photos of your item, add a descriptive title, write an honest description, select the estimated swap value, and specify what items you're looking for. Accurate information increases your chances of finding the right trade partner.
          </p>
        </section>

        {/* Step 4 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>4</div>
            <h2 className={styles.stepTitle}>Browse Listings</h2>
          </div>
          <p className={styles.stepContent}>
            Explore listings, search for items you want, discover nearby listings based on your location, and view detailed listing information. Distance information is based on your saved location in your profile.
          </p>
        </section>

        {/* Step 5 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>5</div>
            <h2 className={styles.stepTitle}>Send a Swap Request</h2>
          </div>
          <p className={styles.stepContent}>
            Select one of your own listings and offer it in exchange for another user's listing. Your request will then be sent to the listing owner, who can review and respond to your proposal.
          </p>
        </section>

        {/* Step 6 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>6</div>
            <h2 className={styles.stepTitle}>Chat With Your Swap Partner</h2>
          </div>
          <p className={styles.stepContent}>
            Once communication is available, discuss important details including item condition, questions about the items, preferred meetup location, and ideal schedule. Please maintain respectful and honest communication throughout the process.
          </p>
        </section>

        {/* Step 7 */}
        <section className={styles.step}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>7</div>
            <h2 className={styles.stepTitle}>Complete the Swap</h2>
          </div>
          <p className={styles.stepContent}>
            When you meet, inspect both items carefully before completing the exchange. We recommend meeting in safe public locations such as shopping malls, coffee shops, school campuses, or police stations.
          </p>
        </section>
      </div>
    </main>
    <Navbar />
  </>
  );
}
