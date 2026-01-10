"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugin on the client side only
gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "50K+", label: "Active Players", color: "#6C85EA" },
  { value: "8", label: "Classic Games", color: "#AAFDBB" },
  { value: "1M+", label: "Games Played", color: "#E9FA00" },
  { value: "24/7", label: "Available", color: "#6C85EA" },
];

export default function Community() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          {
            scale: 0.5,
            opacity: 0,
            y: 50,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="community"
      ref={sectionRef}
      className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-black via-[#0a0a0a] to-black overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#AAFDBB] rounded-full blur-[150px] animate-pulse"></div>
        <div
          className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#E9FA00] rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6">
            Join the{" "}
            <span className="bg-gradient-to-r from-[#6C85EA] via-[#AAFDBB] to-[#E9FA00] bg-clip-text text-transparent">
              Community
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Thousands of players worldwide are already enjoying the action
          </p>
        </div>

        {/* Stats Grid */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/30 transition-all duration-500 cursor-pointer text-center overflow-hidden"
            >
              {/* Glow Effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500"
                style={{ backgroundColor: stat.color }}
              ></div>

              <div className="relative z-10">
                <div
                  className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 sm:mb-3"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base md:text-lg text-white/60 group-hover:text-white/80 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>

              {/* Pulse Ring */}
              <div
                className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"
                style={{ borderColor: stat.color }}
              ></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 w-full max-w-3xl">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Play?
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-white/70 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join our growing community and start your gaming journey today. No
              downloads, no hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group relative px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-black bg-gradient-to-r from-[#6C85EA] to-[#AAFDBB] rounded-full overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(108,133,234,0.6)] hover:shadow-[0_0_60px_rgba(108,133,234,0.9)] w-full sm:w-auto max-w-xs">
                <span className="relative z-10">Start Playing</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#AAFDBB] to-[#E9FA00] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button className="group relative px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-[#AAFDBB] bg-transparent border-2 border-[#AAFDBB] rounded-full overflow-hidden transform hover:scale-105 transition-all duration-300 hover:text-black shadow-[0_0_20px_rgba(170,253,187,0.3)] hover:shadow-[0_0_40px_rgba(170,253,187,0.8)] w-full sm:w-auto max-w-xs">
                <span className="relative z-10">Join Discord</span>
                <div className="absolute inset-0 bg-[#AAFDBB] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
