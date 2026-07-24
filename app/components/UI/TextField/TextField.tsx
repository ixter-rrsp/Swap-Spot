import { InputHTMLAttributes, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

import styles from "./TextField.module.css";

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon: LucideIcon;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  rightIconLabel?: string;
}

export default function TextField({
  label,
  error,
  icon: Icon,
  rightIcon,
  onRightIconClick,
  rightIconLabel,
  id,
  ...props
}: TextFieldProps) {
  return (
    <div className={styles.field}>
      {label && (
        <label
          htmlFor={id}
          className={styles.label}
        >
          {label}
        </label>
      )}

      <div
        className={`${styles.inputWrapper} ${
          error ? styles.inputWrapperError : ""
        }`}
      >
        <Icon
          size={18}
          className={styles.icon}
        />

        <input
          id={id}
          className={styles.input}
          {...props}
        />

        {rightIcon && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onRightIconClick}
            aria-label={rightIconLabel}
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
      </div>

      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}