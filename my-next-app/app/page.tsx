import Hero from "./sections/Hero";
import Services from "./sections/Services";
import TechnologyShowcase from "./sections/TechnologyShowcase";
import Portfolio from "./sections/Portfolio";
import Statistics from "./sections/Statistics";
import ProcessTimeline from "./sections/ProcessTimeline";
import Team from "./sections/Team";
import Testimonials from "./sections/Testimonials";
import CTA from "./sections/CTA";
import Footer from "./sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Hero />
      <Services />
      <TechnologyShowcase />
      <Portfolio />
      <Statistics />
      <ProcessTimeline />
      <Team />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
