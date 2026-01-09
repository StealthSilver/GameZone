"use client";

import Header from "./components/sections/Header";
import Hero from "./components/sections/Hero";
import Features from "./components/sections/Features";
import GameGrid from "./components/sections/GameGrid";
// Testimonials removed: file reported as "not a module"
import Footer from "./components/sections/Footer";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Header />
      <Hero />
      <Features />
      <GameGrid />
      <Footer />
    </main>
  );
}
