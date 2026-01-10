import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-black text-white">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
