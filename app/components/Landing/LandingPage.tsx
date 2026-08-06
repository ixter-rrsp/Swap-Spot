import dynamic from "next/dynamic";
import Nav from "./Nav";
import Hero from "./Hero";
import BackgroundBlobs from "./BackgroundBlobs";
import styles from "./Landing.module.css";

// Everything below the fold is lazy-loaded — it doesn't affect the initial
// paint/interaction of the hero, which is what actually matters for
// perceived load time on a landing page.
const WhySwapSpot = dynamic(() => import("./WhySwapSpot"));
const HowItWorks = dynamic(() => import("./HowItWorks"));
const Features = dynamic(() => import("./Features"));
const FAQ = dynamic(() => import("./FAQ"));
const FinalCTA = dynamic(() => import("./FinalCTA"));
const Footer = dynamic(() => import("./Footer"));

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <BackgroundBlobs />
      <Nav />

      <main id="main-content">
        <Hero />
        <WhySwapSpot />
        <HowItWorks />
        <Features />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
