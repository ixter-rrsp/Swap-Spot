"use client";
import React, { useState } from "react";
import { Menu } from "lucide-react";
import MenuDrawer from "@/app/components/UI/MenuDrawer";
import styles from "./HomeHeader.module.css";
import icon from '../../../../public/src/icon.png'; // or wherever it is

export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
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
            <button
              type="button"
              className={styles.avatarButton}
              aria-label="Profile"
            >
              <img src="/src/karina.jpg" alt="Profile" />
            </button>
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