"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, Heart } from "lucide-react";
import MenuDrawer from "@/app/components/UI/MenuDrawer";
import { useGuestMode } from "@/app/components/Providers/GuestModeContext";
import styles from "./HomeHeader.module.css";
import icon from '../../../../public/src/icon.png'; // or wherever it is

interface HomeHeaderProps {
  avatarUrl?: string | null;
  username?: string | null;
}

export default function HomeHeader({
  avatarUrl = null,
  username = null,
}: HomeHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isGuest, requireAuth } = useGuestMode();
  return (
    <>
      <header className={styles.header}>
        <div className={styles.topRow}>
          <div>
            <div>
              <img src={icon.src} alt="Icon" style={{ width: '180px', height: '50px' }} />
            </div>
            <p className={styles.tagline}>Your spot to <br /> swap.</p>
          </div>

          <div className={styles.headerActions}>
            <Link
              href="/saved"
              className={styles.avatarButton}
              aria-label="Saved listings"
              onClick={(e) => {
                if (isGuest) {
                  e.preventDefault();
                  requireAuth("saved");
                }
              }}
            >
              <span className={styles.avatar}>
                <Heart size={20} />
              </span>
            </Link>
            <button
              type="button"
              className={styles.menuButton}
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}