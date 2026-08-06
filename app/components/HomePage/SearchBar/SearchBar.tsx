"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  Calendar,
} from "lucide-react";

import styles from "./SearchBar.module.css";

export const DATE_FILTER_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "3days", label: "Last 3 Days" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
] as const;

export type DateFilterValue = (typeof DATE_FILTER_OPTIONS)[number]["value"];

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  dateFilter?: string;
  onDateFilterChange?: (filter: string) => void;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  disabled = false,
  dateFilter = "all",
  onDateFilterChange,
  className,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const isFilterActive = dateFilter !== "all";

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const containerClass = className
    ? `${styles.container} ${className}`
    : styles.container;

  return (
    <section
      className={containerClass}
      aria-label="Search items"
      ref={popoverRef}
    >
      <div className={styles.searchBox}>
        <Search
          className={styles.searchIcon}
          size={20}
          aria-hidden="true"
        />

        <input
          type="search"
          placeholder="Search items to swap..."
          className={styles.input}
          aria-label="Search items"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />

        {value.trim() ? (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Clear search text"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <X size={18} />
          </button>
        ) : null}

        <button
          type="button"
          className={`${styles.filterButton} ${isFilterActive ? styles.filterActive : ""}`}
          aria-label="Filter date posted"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
        >
          <SlidersHorizontal size={20} />
          {isFilterActive && <span className={styles.activeDot} />}
        </button>
      </div>

      {isOpen && (
        <div className={styles.popover} role="dialog" aria-label="Filter options">
          <div className={styles.popoverHeader}>
            <div className={styles.popoverTitleRow}>
              <Calendar size={16} className={styles.popoverHeaderIcon} />
              <span className={styles.popoverTitle}>Date Posted</span>
            </div>
            {isFilterActive && (
              <button
                type="button"
                className={styles.resetButton}
                onClick={() => {
                  onDateFilterChange?.("all");
                  setIsOpen(false);
                }}
              >
                Reset
              </button>
            )}
          </div>

          <div className={styles.popoverOptions}>
            {DATE_FILTER_OPTIONS.map((option) => {
              const selected = dateFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.optionButton} ${selected ? styles.optionSelected : ""}`}
                  onClick={() => {
                    onDateFilterChange?.(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {selected && <Check size={16} className={styles.checkIcon} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}