import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import Navbar from "@/app/components/Layout/Navbar/Navbar";
import { ShieldCheck, MapPin, Eye, Lock, AlertTriangle, Flag, Lightbulb, AlertOctagon } from "lucide-react";

export default function TrustAndSafetyPage() {
  return (
    <>
      <main className={styles.container}>
        <div className={styles.content}>
          <PageHeader title="Trust & Safety" />
          <p className={styles.subtitle}>Your guide to safe, transparent, and secure swapping on SwapSpot</p>

          {/* Hero Banner */}
          <div className={styles.heroBanner}>
            <div className={styles.heroIcon}>
              <ShieldCheck size={36} color="#2563eb" />
            </div>
            <div>
              <h3 className={styles.heroTitle}>Safety Comes First</h3>
              <p className={styles.heroText}>
                We build tools and standards so every item trade on SwapSpot is protected, reliable, and worry-free.
              </p>
            </div>
          </div>

          {/* Guidelines Grid */}
          <div className={styles.grid}>
            {/* Card 1 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <MapPin size={22} color="#16a34a" />
                </div>
                <h2 className={styles.cardTitle}>Meet in Public Places</h2>
              </div>
              <p className={styles.cardText}>
                Always organize meetups in well-lit, populated locations:
              </p>
              <ul className={styles.list}>
                <li>Shopping malls & food courts</li>
                <li>Coffee shops & university campuses</li>
                <li>Police station safe-exchange zones</li>
              </ul>
              <div className={styles.warningBox}>
                <AlertOctagon size={16} color="#d97706" style={{ flexShrink: 0 }} />
                <span>Never meet in secluded areas or private residences.</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Eye size={22} color="#2563eb" />
                </div>
                <h2 className={styles.cardTitle}>Inspect Items Thoroughly</h2>
              </div>
              <p className={styles.cardText}>
                Examine both items before confirming the exchange:
              </p>
              <ul className={styles.list}>
                <li>Verify electronic functionality and condition</li>
                <li>Check for unlisted cosmetic defects or damage</li>
                <li>Compare items to listing photos and descriptions</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Lock size={22} color="#9333ea" />
                </div>
                <h2 className={styles.cardTitle}>Protect Personal Info</h2>
              </div>
              <p className={styles.cardText}>
                Keep sensitive details private during communication:
              </p>
              <ul className={styles.list}>
                <li>Keep conversations within SwapSpot chat</li>
                <li>Never share banking info, passwords, or OTPs</li>
                <li>Avoid sharing personal home or office addresses</li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <AlertTriangle size={22} color="#d97706" />
                </div>
                <h2 className={styles.cardTitle}>Watch Out for Scams</h2>
              </div>
              <p className={styles.cardText}>
                Be cautious of red flags and high-risk behaviors:
              </p>
              <ul className={styles.list}>
                <li>Requests for advance wire transfers or gift cards</li>
                <li>Pressuring urgent decisions or off-platform contact</li>
                <li>Prices or items that sound too good to be true</li>
              </ul>
              <div className={styles.tipBox}>
                <Lightbulb size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                <span>Trust your instincts — if something feels off, walk away.</span>
              </div>
            </div>
          </div>

          {/* Report Section */}
          <div className={styles.reportSection}>
            <div className={styles.reportHeader}>
              <Flag size={24} color="#dc2626" />
              <h2 className={styles.reportTitle}>Reporting Suspicious Activity</h2>
            </div>
            <p className={styles.reportText}>
              Help us maintain a safe community. Report any user who engages in harassment, lists prohibited goods, attempts fraud, or violates community terms. Our moderation team reviews all reports promptly.
            </p>
          </div>
        </div>
      </main>
      <Navbar />
    </>
  );
}
