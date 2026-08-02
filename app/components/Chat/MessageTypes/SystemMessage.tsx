import styles from "./SystemMessage.module.css";

interface SystemMessageProps {
  text: string;
  isMine: boolean;
}

export default function SystemMessage({ text, isMine }: SystemMessageProps) {
  // System messages are stored once and shown identically to both
  // participants, so a stored actor name can't say "You" for both sides.
  // Instead the stored text carries a neutral {{actor}} placeholder that we
  // resolve per-viewer here.
  const resolvedText = text.replace(
    /\{\{actor\}\}/g,
    isMine ? "You" : "The other party"
  );

  return (
    <div className={styles.container}>
      <span className={styles.text}>{resolvedText}</span>
    </div>
  );
}