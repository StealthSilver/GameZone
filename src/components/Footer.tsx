"use client";

import {
  Gamepad2,
  Github,
  Twitter,
  Youtube,
  MessageCircle,
} from "lucide-react";

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "Github" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: MessageCircle, href: "#", label: "Discord" },
];

export default function Footer() {
  return (
    <footer className="relative py-16 overflow-hidden bg-black">
      {/* Animated Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Gamepad2 className="w-10 h-10 text-primary relative z-10" />
              <div className="absolute inset-0 blur-lg bg-primary/50" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-wider">
              THE GAME ZONE
            </span>
          </div>

          {/* Tagline */}
          <p className="text-white/70 mb-8 max-w-md">
            Classic games reimagined for the modern era. Play, compete, and
            relive the magic.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4 mb-12">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="group relative w-12 h-12 flex items-center justify-center rounded-full border border-white/20 hover:border-primary transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-white/70 group-hover:text-primary transition-colors" />
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_30px_rgba(108,133,234,0.6)] transition-opacity duration-300" />
                </a>
              );
            })}
          </div>

          {/* Bottom Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70 mb-8">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contact Us
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} The Game Zone. All rights reserved.
          </p>
        </div>
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/10 blur-[100px]" />
    </footer>
  );
}
