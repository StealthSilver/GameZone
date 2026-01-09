'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: '⚡',
    title: 'Instant Play',
    description: 'Jump into games instantly without downloads or installations',
  },
  {
    icon: '🎮',
    title: 'Classic Games, Modern UI',
    description: 'Timeless gameplay meets sleek, contemporary design',
  },
  {
    icon: '🧠',
    title: 'Skill-Based Gameplay',
    description: 'Master your skills and compete with players worldwide',
  },
  {
    icon: '🌙',
    title: 'Dark Neon Interface',
    description: 'Premium dark theme with stunning neon aesthetics',
  },
];

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 0.5,
            markers: false,
          },
          opacity: 0,
          y: 50,
          duration: 1,
        });

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            duration: 0.4,
            ease: 'power2.out',
          });
          gsap.to(card.querySelector('.feature-icon'), {
            scale: 1.2,
            duration: 0.4,
            ease: 'power2.out',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          });
          gsap.to(card.querySelector('.feature-icon'), {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={containerRef}
      className="relative py-24 md:py-32 px-4 md:px-6 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl pointer-events-none">
        <div className="absolute inset-0 bg-primary opacity-5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Why <span className="text-primary">Game Zone</span>?
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover what makes our platform the ultimate gaming destination
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="group relative p-6 md:p-8 rounded-xl border border-primary/20 bg-gradient-to-br from-slate-900/50 to-slate-950/50 hover:border-secondary/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="feature-icon text-5xl mb-4 transform transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="absolute inset-0 rounded-xl border border-secondary/0 group-hover:border-secondary/50 transition-colors duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
