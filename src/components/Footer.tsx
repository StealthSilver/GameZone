"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animated divider line
      if (dividerRef.current) {
        gsap.fromTo(
          dividerRef.current,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const socialLinks = [
    { name: "Twitter", icon: "𝕏", color: "#6C85EA" },
    { name: "Discord", icon: "💬", color: "#AAFDBB" },
    { name: "GitHub", icon: "⚡", color: "#E9FA00" },
    { name: "YouTube", icon: "▶", color: "#6C85EA" },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative bg-gradient-to-b from-black via-[#0a0a0a] to-black border-t border-white/10 overflow-hidden"
    >
      {/* Animated Divider Line */}
      <div
        ref={dividerRef}
        className="h-1 bg-gradient-to-r from-transparent via-[#6C85EA] to-transparent shadow-[0_0_20px_rgba(108,133,234,0.8)] origin-center"
      ></div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[300px] bg-[#6C85EA] rounded-full blur-[200px] opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C85EA] to-[#AAFDBB] flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-[0_0_25px_rgba(108,133,234,0.6)]">
                <span className="text-2xl">🎮</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#6C85EA] to-[#AAFDBB] bg-clip-text text-transparent">
                The Game Zone
              </span>
            </div>
            <p className="text-white/60 leading-relaxed max-w-xs">
              Where nostalgia meets innovation. Experience gaming like never
              before.
            </p>
            <p className="text-sm text-[#E9FA00] font-medium">
              ⚡ Play. Compete. Dominate.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-[#6C85EA]/30 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                "Games",
                "Features",
                "Community",
                "Testimonials",
                "About Us",
                "Contact",
              ].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(" ", "-")}`}
                    className="text-white/60 hover:text-[#6C85EA] transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="w-0 h-0.5 bg-[#6C85EA] group-hover:w-4 transition-all duration-300"></span>
                    <span>{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-[#AAFDBB]/30 pb-2 inline-block">
              Connect With Us
            </h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="group relative w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 flex items-center justify-center transition-all duration-300 hover:transform hover:scale-110 hover:-translate-y-1"
                  style={{
                    boxShadow: `0 0 0 rgba(108, 133, 234, 0)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 30px ${social.color}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 rgba(108, 133, 234, 0)`;
                  }}
                >
                  <span className="text-2xl transform group-hover:scale-125 transition-transform duration-300">
                    {social.icon}
                  </span>

                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-white/20 shadow-[0_0_20px_rgba(108,133,234,0.5)]">
                    {social.name}
                  </div>
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-white/60 mb-3">
                Stay updated with new games
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#6C85EA] transition-colors duration-300"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-[#6C85EA] to-[#AAFDBB] text-black font-bold rounded-lg hover:shadow-[0_0_30px_rgba(108,133,234,0.6)] transition-all duration-300 transform hover:scale-105">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-white/40 text-sm">
            © 2026 The Game Zone. All rights reserved.
          </p>

          <div className="flex space-x-6 text-sm text-white/40">
            <a
              href="#"
              className="hover:text-[#6C85EA] transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-[#6C85EA] transition-colors duration-300"
            >
              Terms of Service
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-[#6C85EA] transition-colors duration-300"
            >
              Cookie Policy
            </a>
          </div>

          <p className="text-xs text-white/30">
            Made with <span className="text-[#E9FA00] animate-pulse">⚡</span>{" "}
            by passionate gamers
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#6C85EA] rounded-full blur-[100px] opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#AAFDBB] rounded-full blur-[100px] opacity-10"></div>
    </footer>
  );
}
