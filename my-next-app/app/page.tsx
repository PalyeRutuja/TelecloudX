import Hero from "./sections/Hero";
import StatsTicker from "./sections/StatsTicker";
import Intro from "./sections/Intro";
import Services from "./sections/Services";
import CTA from "./sections/CTA";
import Footer from "./sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <StatsTicker />
      <Intro />
      <Services />
      <CTA />
      <Footer />
    </main>
  );
}