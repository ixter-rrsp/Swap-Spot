import styles from "./page.module.css";
import PageHeader from "@/app/components/UI/PageHeader/PageHeader";
import Link from "next/link";
import { Repeat, ShieldCheck, Users, Zap, Heart, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <main className={styles.container}>
        <div className={styles.content}>
          <PageHeader title="About SwapSpot" showBack />
          <p className={styles.subtitle}>Reimagining local trading through seamless item-for-item swaps</p>

          {/* Hero Section */}
          <div className={styles.heroSection}>
            <div className={styles.logoBadge}>
              <Repeat size={32} color="#ffffff" />
            </div>
            <h2 className={styles.heroTitle}>Swap More, Waste Less</h2>
            <p className={styles.heroDescription}>
              SwapSpot is a modern peer-to-peer bartering platform designed to give unused items new life. We connect communities to trade pre-loved goods directly without relying on cash transactions.
            </p>
          </div>

          {/* Mission & Vision Grid */}
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIconWrap} style={{ background: "#dbeafe", color: "#2563eb" }}>
                <ShieldCheck size={22} />
              </div>
              <h3 className={styles.valueTitle}>Safe & Trusted</h3>
              <p className={styles.valueText}>
                Built-in location radius, user ratings, and verified swap agreements ensure transparent trades.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIconWrap} style={{ background: "#dcfce7", color: "#16a34a" }}>
                <Heart size={22} />
              </div>
              <h3 className={styles.valueTitle}>Sustainable Trading</h3>
              <p className={styles.valueText}>
                Reduce waste by keeping quality items in circulation and out of landfills.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIconWrap} style={{ background: "#f3e8ff", color: "#9333ea" }}>
                <Users size={22} />
              </div>
              <h3 className={styles.valueTitle}>Community Driven</h3>
              <p className={styles.valueText}>
                Empowering neighbors to trade value-for-value and discover great items right nearby.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIconWrap} style={{ background: "#fef3c7", color: "#d97706" }}>
                <Zap size={22} />
              </div>
              <h3 className={styles.valueTitle}>Fast & Simple</h3>
              <p className={styles.valueText}>
                Propose swaps in seconds, chat directly with owners, and finalize trades seamlessly.
              </p>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className={styles.linksCard}>
            <h3 className={styles.linksTitle}>Explore SwapSpot</h3>
            <div className={styles.linksList}>
              <Link href="/how-it-works" className={styles.linkItem}>
                <span>How It Works</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/trust-and-safety" className={styles.linkItem}>
                <span>Trust & Safety Guidelines</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/help" className={styles.linkItem}>
                <span>Help Center & FAQ</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className={styles.linkItem}>
                <span>Get in Touch</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
