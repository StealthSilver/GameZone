import Header from "./components/sections/Header";
import Hero from "./components/sections/Hero";
import Features from "./components/sections/Features";
import GameGrid from "./components/sections/GameGrid";
import Community from "./components/sections/Community";
import Testimonials from "./components/sections/Testimonials";
import Footer from "./components/sections/Footer";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Header />
      <Hero />
      <Features />
      <GameGrid />
      <Community />
      <Testimonials />
      <Footer />
    </main>
  );
}
