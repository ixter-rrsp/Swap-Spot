import { Suspense } from "react";
import styles from "./page.module.css";
import LoginForm from "@/app/components/Auth/LoginForm/LoginForm";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <PageHeader title="Sign In" subtitle="Welcome back — sign in to continue." />

        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}