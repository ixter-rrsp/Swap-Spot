import styles from "./Spinner.module.css";

interface SpinnerProps {
  size?: number;
}

export default function Spinner({
  size = 20,
}: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{
        width: size,
        height: size,
      }}
      aria-hidden="true"
    />
  );
}