"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2 } from "lucide-react";
import gsap from "gsap";

const navLinks = ["Home", "Games", "Features", "Community", "Testimonials"];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(108,133,234,0.3)] py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-3 group cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("home");
          }}
        >
          <div className="relative">
            <Gamepad2 className="w-8 h-8 text-primary transition-all duration-300 group-hover:text-secondary relative z-10" />
            <div className="absolute inset-0 blur-lg bg-primary/50 group-hover:bg-secondary/50 transition-all duration-300" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-wider">
            THE GAME ZONE
          </span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.toLowerCase());
              }}
              className="relative text-white/70 hover:text-foreground transition-colors duration-300 font-medium group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(108,133,234,0.6)] transition-all duration-300 hover:scale-105">
          Play Now
        </button>

        {/* Mobile Menu Button */}
        <button className="md:hidden flex flex-col gap-1.5 p-2">
          <span className="w-6 h-0.5 bg-primary" />
          <span className="w-4 h-0.5 bg-secondary" />
          <span className="w-6 h-0.5 bg-accent" />
        </button>
      </div>
    </nav>
  );
}
