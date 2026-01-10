import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import GamesGrid from "@/components/GamesGrid";
import Community from "@/components/Community";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <GamesGrid />
      <Community />
      <Testimonials />
      <Footer />
    </main>
  );
}
