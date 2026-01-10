"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(
        headlineRef.current,
        { y: 100, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power4.out",
          delay: 0.3,
        }
      );

      // Subheading animation
      gsap.fromTo(
        subheadingRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.6 }
      );

      // CTA buttons animation
      gsap.fromTo(
        ctaRef.current?.children || [],
        { y: 30, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.7)",
          delay: 0.9,
        }
      );

      // Floating particles animation
      if (particlesRef.current) {
        const particles = particlesRef.current.children;
        gsap.to(particles, {
          y: "random(-50, 50)",
          x: "random(-50, 50)",
          rotation: "random(-180, 180)",
          duration: "random(3, 5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.2,
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
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
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#6C85EA] rounded-full blur-[150px] opacity-20 animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-[#AAFDBB] rounded-full blur-[150px] opacity-20 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E9FA00] rounded-full blur-[200px] opacity-10"></div>

      {/* Floating Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: ["#6C85EA", "#AAFDBB", "#E9FA00"][i % 3],
            }}
          >
            {["🎮", "🎯", "♟️", "🎲", "🕹️", "👾"][i % 6]}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h1
          ref={headlineRef}
          className="text-6xl md:text-8xl font-black mb-6 leading-tight"
        >
          <span className="block bg-gradient-to-r from-[#6C85EA] via-[#AAFDBB] to-[#E9FA00] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(108,133,234,0.5)]">
            Classic Games.
          </span>
          <span className="block text-white mt-2 drop-shadow-[0_0_20px_rgba(170,253,187,0.3)]">
            Modern Energy.
          </span>
        </h1>

        <p
          ref={subheadingRef}
          className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Experience nostalgic gameplay reimagined with cutting-edge design.
          <br />
          <span className="text-[#AAFDBB]">
            Multiplayer-ready. Skill-based. Electrifying.
          </span>
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <button className="group relative px-10 py-5 text-lg font-bold text-black bg-gradient-to-r from-[#6C85EA] to-[#AAFDBB] rounded-full overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(108,133,234,0.6)] hover:shadow-[0_0_60px_rgba(108,133,234,0.9)]">
            <span className="relative z-10">Play Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#AAFDBB] to-[#E9FA00] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button className="group relative px-10 py-5 text-lg font-bold text-[#6C85EA] bg-transparent border-2 border-[#6C85EA] rounded-full overflow-hidden transform hover:scale-105 transition-all duration-300 hover:text-black shadow-[0_0_20px_rgba(108,133,234,0.3)] hover:shadow-[0_0_40px_rgba(108,133,234,0.8)]">
            <span className="relative z-10">Explore Games</span>
            <div className="absolute inset-0 bg-[#6C85EA] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#6C85EA] rounded-full flex items-start justify-center p-2 shadow-[0_0_20px_rgba(108,133,234,0.5)]">
          <div className="w-1.5 h-1.5 bg-[#6C85EA] rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
