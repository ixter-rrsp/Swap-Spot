import styles from "../login/page.module.css";
import ForgotPasswordForm from "@/app/components/Auth/ForgotPasswordForm/ForgotPasswordForm";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";

export default function ForgotPasswordPage() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <PageHeader
          title="Reset Password"
          subtitle="We'll help you get back into your account."
          showBack
        />

        <ForgotPasswordForm />
      </div>
    </main>
  );
}