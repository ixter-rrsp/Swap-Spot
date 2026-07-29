"use client";
import { X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import styles from "./MenuDrawer.module.css";

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const supabase = createClient();

  if (!open) return null;

  const handleOverlayClick = () => onClose();
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const navigationItems = [
    { name: "Subscriptions & Plans", href: "/subscriptions" },
    { name: "Edit Profile", href: "/profile/edit" },
    { name: "About Us", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Help Center", href: "/help" },
    { name: "Trust & Safety", href: "/trust-and-safety" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Contact Us", href: "/contact" },
  ];

  const handleLogout = async () => {
    onClose();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      {/* Desktop Drawer */}
      <div className={`${styles.drawer} ${styles.desktop}`} onClick={stopPropagation}>
        <ul className={styles.menuList}>
          {navigationItems.map((item) => (
            <li key={item.href} className={styles.menuItem}>
              <Link href={item.href} onClick={onClose}>
                {item.name}
              </Link>
            </li>
          ))}
          <li className={styles.menuItem}>
            <button className={styles.logoutLink} onClick={handleLogout}>
              Log Out
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile Card */}
      <div className={`${styles.drawer} ${styles.mobile}`} onClick={stopPropagation}>
        <button className={styles.closeBtn} aria-label="Close menu" onClick={onClose}>
          <X size={20} />
        </button>
        <ul className={styles.menuList}>
          {navigationItems.map((item) => (
            <li key={item.href} className={styles.menuItem}>
              <Link href={item.href} onClick={onClose}>
                {item.name}
              </Link>
            </li>
          ))}
          <li className={styles.menuItem}>
            <button className={styles.logoutLink} onClick={handleLogout}>
              Log Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
