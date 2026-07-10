import styles from "./page.module.css";

import SignupForm from "@/app/components/Auth/SignupForm/SignupForm";

export default function SignupPage() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          Create Account
        </h1>

        <p className={styles.subtitle}>
          Join SwapSpot and start swapping.
        </p>

        <SignupForm />
      </div>
    </main>
  );
}