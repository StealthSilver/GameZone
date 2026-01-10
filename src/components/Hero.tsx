"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Play, Sparkles } from "lucide-react";

// Fixed positions for particles to avoid hydration mismatch
const gameIcons = ["🎮", "🎲", "♟️", "🎯", "🕹️", "🏆"];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const floatingIconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
        opacity: 0,
        y: 50,
      });

      // Title animation
      gsap.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.3,
      });

      // Subtitle animation
      gsap.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
      });

      // Buttons animation
      gsap.to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.7,
      });

      // Floating icons animation
      if (floatingIconsRef.current) {
        const icons =
          floatingIconsRef.current.querySelectorAll(".floating-icon");
        gsap.set(icons, { opacity: 0, scale: 0 });
        gsap.to(icons, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 1,
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `
              linear-gradient(to right, #6C85EA 1px, transparent 1px),
              linear-gradient(to bottom, #6C85EA 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-[100px] animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />

      {/* Floating Game Icons */}
      <div
        ref={floatingIconsRef}
        className="absolute inset-0 pointer-events-none"
      >
        {gameIcons.map((icon, index) => (
          <div
            key={index}
            className="floating-icon absolute text-4xl opacity-30"
            style={{
              left: `${15 + index * 15}%`,
              top: `${20 + (index % 3) * 25}%`,
              animation: `float 3s ease-in-out infinite`,
              animationDelay: `${index * 0.5}s`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
        >
          <span className="text-foreground">Classic Games.</span>
          <br />
          <span className="text-primary drop-shadow-[0_0_30px_rgba(108,133,234,0.8)]">
            Modern Energy.
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10"
        >
          Experience timeless classics reimagined with stunning visuals,
          multiplayer support, and that satisfying neon glow. Your premium
          gaming destination awaits.
        </p>

        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button className="group flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:shadow-[0_0_40px_rgba(108,133,234,0.8)] transition-all duration-300 hover:scale-105">
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Play Now
          </button>
          <button className="group flex items-center gap-3 px-8 py-4 border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-secondary hover:text-black hover:shadow-[0_0_40px_rgba(170,253,187,0.8)] transition-all duration-300 hover:scale-105">
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Explore Games
          </button>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2 shadow-[0_0_20px_rgba(108,133,234,0.5)]">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
