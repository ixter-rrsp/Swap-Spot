import styles from "./SystemMessage.module.css";

interface SystemMessageProps {
  text: string;
}

export default function SystemMessage({ text }: SystemMessageProps) {
  return (
    <div className={styles.container}>
      <span className={styles.text}>{text}</span>
    </div>
  );
}