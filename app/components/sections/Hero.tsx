'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(titleRef.current, {
        duration: 1,
        opacity: 0,
        y: 30,
        ease: 'power2.out',
      })
        .from(
          subtitleRef.current,
          {
            duration: 1,
            opacity: 0,
            y: 20,
            ease: 'power2.out',
          },
          '-=0.5'
        )
        .from(
          ctaRef.current,
          {
            duration: 1,
            opacity: 0,
            y: 20,
            ease: 'power2.out',
          },
          '-=0.5'
        );

      gsap.to(gridRef.current, {
        duration: 6,
        y: -20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-accent opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div
        ref={gridRef}
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(108, 133, 234, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(108, 133, 234, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight"
        >
          <span className="block text-white mb-2">Classic Games.</span>
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Modern Energy.
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Experience the nostalgia of timeless classics with a sleek, modern interface. Play anywhere,
          compete everywhere, win real rewards.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group relative px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-primary to-secondary text-slate-950 font-bold text-lg rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Play Now 🎮
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button className="group relative px-8 py-4 md:px-10 md:py-5 border-2 border-primary text-primary font-bold text-lg rounded-xl hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
            Explore Games →
          </button>
        </div>

        <div className="mt-16 md:mt-20 flex flex-wrap justify-center gap-8 text-center">
          <div className="group">
            <div className="text-3xl md:text-4xl font-bold text-secondary group-hover:text-accent transition-colors">
              8+
            </div>
            <div className="text-sm text-gray-400 mt-1">Classic Games</div>
          </div>
          <div className="group">
            <div className="text-3xl md:text-4xl font-bold text-secondary group-hover:text-accent transition-colors">
              ∞
            </div>
            <div className="text-sm text-gray-400 mt-1">Players Connected</div>
          </div>
          <div className="group">
            <div className="text-3xl md:text-4xl font-bold text-secondary group-hover:text-accent transition-colors">
              24/7
            </div>
            <div className="text-sm text-gray-400 mt-1">Always Open</div>
          </div>
        </div>
      </div>
    </section>
  );
}
