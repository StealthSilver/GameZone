'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Games', href: '#games' },
  { name: 'Features', href: '#features' },
  { name: 'Community', href: '#community' },
  { name: 'Testimonials', href: '#testimonials' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/80 backdrop-blur-md shadow-lg shadow-primary/20'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 py-4 md:px-6 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-2 group">
            <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
              🎮
            </div>
            <div className="hidden sm:block">
              <div className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                The Game Zone
              </div>
              <div className="text-xs text-secondary leading-none">Play. Connect. Win.</div>
            </div>
          </div>
        </Link>

        <div className="hidden lg:flex gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="relative text-gray-300 hover:text-primary transition-colors duration-300 group font-medium"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </div>

        <div className="lg:hidden">
          <div className="w-8 h-6 flex flex-col justify-between cursor-pointer group">
            <span className="w-full h-0.5 bg-primary group-hover:bg-secondary transition-colors"></span>
            <span className="w-full h-0.5 bg-primary group-hover:bg-secondary transition-colors"></span>
            <span className="w-full h-0.5 bg-primary group-hover:bg-secondary transition-colors"></span>
          </div>
        </div>

        <div className="hidden md:flex gap-4">
          <button className="px-5 py-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-slate-950 transition-all duration-300 hover:shadow-lg hover:shadow-primary/50">
            Sign In
          </button>
          <button className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-primary to-secondary text-slate-950 rounded-lg hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 transform">
            Play Now
          </button>
        </div>
      </nav>
    </header>
  );
}
