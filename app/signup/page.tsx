import styles from "./page.module.css";

import SignupForm from "@/app/components/Auth/SignupForm/SignupForm";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function SignupPage() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <PageHeader title="Create Account" subtitle="Join SwapSpot and start swapping." />

        <SignupForm />
      </div>
    </main>
  );
}