"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Plus,
  Compass,
  User,
  Bell,
} from "lucide-react";
import styles from "./Navbar.module.css";

const navItems = [
  {
    href: "/home",
    icon: House,
  },
  {
    href: "/delivery",
    icon: Compass,
  },
  {
    href: "/notifications",
    icon: Bell,
  },
  {
    href: "/profile",
    icon: User,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                active ? styles.active : ""
              }`}
            >
              <Icon size={22} strokeWidth={2} />
            </Link>
          );
        })}

        {/* Spacer for Floating Button */}
        <div className={styles.centerSpacer} />

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                active ? styles.active : ""
              }`}
            >
              <Icon size={22} strokeWidth={2} />
            </Link>
          );
        })}
      </div>

      <Link
        href="/post"
        className={styles.postButton}
        aria-label="Create new listing"
      >
        <Plus size={32} strokeWidth={2.5} />
      </Link>
    </nav>
  );
}