import styles from "./page.module.css";

import LoginForm from "@/app/components/Auth/LoginForm/LoginForm";

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <LoginForm />
      </div>
    </main>
  );
}