"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Plus,
  Compass,
  User,
  Bell,
  Repeat
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

interface NavbarProps {
  unreadCount?: number;
}

export default function Navbar({
  unreadCount = 0,
}: NavbarProps) {

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
            <div className={styles.iconWrapper}>
              <Icon
                size={22}
                strokeWidth={2}
              />

              {item.href === "/notifications" &&
                unreadCount > 0 && (
                  <span className={styles.badge}>
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
            </div>
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
            <div className={styles.iconWrapper}>
              <Icon
                size={22}
                strokeWidth={2}
              />

              {item.href === "/notifications" &&
                unreadCount > 0 && (
                  <span className={styles.badge}>
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
            </div>
          </Link>
          );
        })}
      </div>

      <Link
        href="/post"
        className={styles.postButton}
        aria-label="Create new listing"
      >
        <Repeat size={32} strokeWidth={2.5} />
      </Link>
    </nav>
  );
}