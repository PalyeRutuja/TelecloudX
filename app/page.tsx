import Hero from "./sections/Hero";
import Services from "./sections/Services";
import CTA from "./sections/CTA";
import Footer from "./sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Hero />
      <Services />
      <CTA />
      <Footer />
    </main>
  );
}
