import { Suspense } from "react";
import styles from "../login/page.module.css";
import ResetPasswordForm from "@/app/components/Auth/ResetPasswordForm/ResetPasswordForm";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function ResetPasswordPage() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <PageHeader title="Reset Password" />

        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}