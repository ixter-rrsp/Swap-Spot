import Image from "next/image";
import Link from "next/link";
import styles from "./Landing.module.css";
import heroIllustration from "@/public/hero-illustration.png";

export default function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-heading">
      <div>
        <h1 id="hero-heading" className={styles.heroHeadline}>
          Trade Smarter. Own Less.{" "}
          <span className={styles.accent}>Get More.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          SwapSpot lets you exchange items directly with other people without
          selling or buying.
        </p>

        <div className={styles.heroActions}>
          <Link href="/listings" className={styles.heroSecondaryButton}>
            Browse Listings
          </Link>
          <Link href="/signup" className={styles.heroPrimaryButton}>
            Get Started
          </Link>
        </div>
      </div>

      <div className={styles.heroImageWrap}>
        <Image
          src={heroIllustration}
          alt="Illustration of a camera, office chair, and keyboard being swapped between people"
          className={styles.heroImage}
          priority
          sizes="(max-width: 900px) 90vw, 520px"
        />
      </div>
    </section>
  );
}
