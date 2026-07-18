import {
  CircleCheck,
  Package,
  Truck,
  Star,
  BadgeCheck,
} from "lucide-react";

import styles from "./ProfileStats.module.css";

const shortcuts = [
  {
    icon: CircleCheck,
    label: "To Confirm",
  },
  {
    icon: Package,
    label: "To Exchange",
  },
  {
    icon: Truck,
    label: "To Receive",
  },
  {
    icon: Star,
    label: "To Rate",
  },
  {
    icon: BadgeCheck,
    label: "Completed",
  },
];

export default function ProfileStats() {
  return (
    <section className={styles.container}>
      {shortcuts.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            className={styles.item}
          >
            <Icon size={26} />

            <span>{item.label}</span>
          </button>
        );
      })}
    </section>
  );
}