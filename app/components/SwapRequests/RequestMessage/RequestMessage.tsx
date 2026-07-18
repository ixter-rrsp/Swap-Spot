import styles from "./RequestMessage.module.css";

interface RequestMessageProps {
  message?: string | null;
}

export default function RequestMessage({
  message,
}: RequestMessageProps) {

  if (!message?.trim()) {
    return null;
  }

  return (
    <section className={styles.container}>

      <h2 className={styles.title}>
        Message
      </h2>

      <p className={styles.message}>
        {message}
      </p>

    </section>
  );
}