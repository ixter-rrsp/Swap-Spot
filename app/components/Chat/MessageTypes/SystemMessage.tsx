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
  const resolvedText = text
    .replace(/\{\{actor\}\}/g, isMine ? "You" : "The other party")
    // Some messages are authored with a blank line ("\n\n") between two
    // sentences for spacing when read as raw text. With white-space:
    // pre-line + box-decoration-break: clone (below), a literal blank
    // line renders as its own empty rounded pill, which looks like a
    // stray bubble. Collapse runs of newlines to a single line break so
    // there's nothing left to render as an empty segment.
    .replace(/\n{2,}/g, "\n");

  return (
    <div className={styles.container}>
      <span className={styles.text}>{resolvedText}</span>
    </div>
  );
}