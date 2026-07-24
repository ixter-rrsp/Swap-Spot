import {
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { LucideIcon } from "lucide-react";

import styles from "./TextArea.module.css";

interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon: LucideIcon;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  rightIconLabel?: string;
}

export default function TextArea({
  label,
  error,
  icon: Icon,
  rightIcon,
  onRightIconClick,
  rightIconLabel,
  ...props
}: TextAreaProps) {
  return (
    <div className={styles.field}>
      {label && (
        <label
          htmlFor={props.id}
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

        <textarea
          id={props.id}
          className={styles.textarea}
          {...props}
        />

        {rightIcon && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onRightIconClick}
            aria-label={rightIconLabel}
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