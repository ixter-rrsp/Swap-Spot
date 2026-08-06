"use client";
import { X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useGuestMode } from "@/app/components/Providers/GuestModeContext";
import styles from "./MenuDrawer.module.css";

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

// Always safe for a guest to view — these just teach them about the site.
const PUBLIC_ITEMS = [
  { name: "About Us", href: "/about" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Help Center", href: "/help" },
  { name: "Trust & Safety", href: "/trust-and-safety" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Contact Us", href: "/contact" },
];

// Only make sense once someone has an account.
const ACCOUNT_ITEMS = [
  { name: "Subscriptions & Plans", href: "/subscriptions" },
  { name: "Edit Profile", href: "/profile/edit" },
];

export default function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const supabase = createClient();
  const { isGuest, loading } = useGuestMode();

  if (!open) return null;

  const handleOverlayClick = () => onClose();
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  // While the auth check is in flight, don't flash account-only items —
  // treat as guest until we know otherwise.
  const showAccountItems = !loading && !isGuest;
  const navigationItems = showAccountItems
    ? [...ACCOUNT_ITEMS, ...PUBLIC_ITEMS]
    : PUBLIC_ITEMS;

  const handleLogout = async () => {
    onClose();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const renderList = () => (
    <ul className={styles.menuList}>
      {navigationItems.map((item) => (
        <li key={item.href} className={styles.menuItem}>
          <Link href={item.href} onClick={onClose}>
            {item.name}
          </Link>
        </li>
      ))}
      <li className={styles.menuItem}>
        {showAccountItems ? (
          <button className={styles.logoutLink} onClick={handleLogout}>
            Log Out
          </button>
        ) : (
          <Link href="/login" onClick={onClose}>
            Log In
          </Link>
        )}
      </li>
      {!showAccountItems && (
        <li className={styles.menuItem}>
          <Link href="/signup" onClick={onClose}>
            Sign Up
          </Link>
        </li>
      )}
    </ul>
  );

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      {/* Desktop Drawer */}
      <div className={`${styles.drawer} ${styles.desktop}`} onClick={stopPropagation}>
        {renderList()}
      </div>

      {/* Mobile Card */}
      <div className={`${styles.drawer} ${styles.mobile}`} onClick={stopPropagation}>
        <button className={styles.closeBtn} aria-label="Close menu" onClick={onClose}>
          <X size={20} />
        </button>
        {renderList()}
      </div>
    </div>
  );
}
