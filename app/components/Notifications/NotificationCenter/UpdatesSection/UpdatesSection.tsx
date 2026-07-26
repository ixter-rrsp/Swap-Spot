"use client";

import {
  Notification,
  NotificationCategorySummary,
  NotificationCategory,
} from "@/lib/types/Notification";

import NotificationCategoryCard from "./NotificationCategoryCard";

import styles from "./UpdatesSection.module.css";

interface UpdatesSectionProps {
  categories: NotificationCategorySummary[];
  selectedCategory: NotificationCategory | null;
  onSelectCategory: (category: NotificationCategory) => void;
  notifications: Notification[] | null;
  isLoading: boolean;
  error: string | null;
}

export default function UpdatesSection({
  categories,
  selectedCategory,
  onSelectCategory,
  notifications,
  isLoading,
  error,
}: UpdatesSectionProps) {
  return (
    <div className={styles.list}>
      {categories.map((category) => (
        <NotificationCategoryCard
          key={category.category}
          summary={category}
          selected={selectedCategory === category.category}
          onClick={() => onSelectCategory(category.category)}
          notifications={
            selectedCategory === category.category ? notifications : null
          }
          isLoading={selectedCategory === category.category && isLoading}
          error={selectedCategory === category.category ? error : null}
        />
      ))}
    </div>
  );
}