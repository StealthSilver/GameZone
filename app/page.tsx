// app/page.tsx
import Header from "./components/sections/Header";
import Hero from "./components/sections/Hero";
import Features from "./components/sections/Features";
import GamesGrid from "./components/sections/GameGrid";
import Footer from "./components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <GamesGrid />
      <Footer />
    </main>
  );
}
