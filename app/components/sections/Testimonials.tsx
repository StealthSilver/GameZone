'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "Feels like childhood, built for the future.",
    author: 'Alex Chen',
    role: 'Gaming Enthusiast',
    avatar: '👨‍💼',
  },
  {
    quote: 'The smoothest gaming experience I\'ve had online. Absolutely addictive!',
    author: 'Sarah Martinez',
    role: 'Competitive Player',
    avatar: '👩‍🎨',
  },
  {
    quote: 'Finally, a platform that respects my time and delivers pure fun.',
    author: 'James Wilson',
    role: 'Casual Gamer',
    avatar: '👨‍🎓',
  },
  {
    quote: 'The neon aesthetic combined with flawless gameplay is unmatched.',
    author: 'Emma Rodriguez',
    role: 'Game Designer',
    avatar: '👩‍💻',
  },
];

export default function Testimonials() {
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
          x: index % 2 === 0 ? -50 : 50,
          duration: 0.8,
        });

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -8,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(card.querySelector('.testimonial-border'), {
            borderColor: 'rgba(170, 253, 187, 0.6)',
            duration: 0.3,
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(card.querySelector('.testimonial-border'), {
            borderColor: 'rgba(108, 133, 234, 0.3)',
            duration: 0.3,
          });
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="testimonials"
      ref={containerRef}
      className="relative py-24 md:py-32 px-4 md:px-6 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl pointer-events-none">
        <div className="absolute inset-0 bg-primary opacity-3 rounded-full filter blur-3xl"></div>
      </div>

      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="400" height="400" filter="url(%23noiseFilter)" /%3E%3C/svg%3E")',
        }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            What Players <span className="text-secondary">Say</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join thousands of gamers who've already experienced the magic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="group relative cursor-pointer"
            >
              <div
                className="testimonial-border relative p-8 rounded-xl border-2 transition-all duration-300 h-full flex flex-col justify-between"
                style={{ borderColor: 'rgba(108, 133, 234, 0.3)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-slate-900/50 to-slate-950/50 rounded-xl group-hover:from-primary/10 transition-all duration-300"></div>

                <div className="relative z-10 space-y-6">
                  <div>
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-secondary">⭐ ⭐ ⭐ ⭐ ⭐</span>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-primary/20">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg group-hover:text-secondary transition-colors duration-300">
                        {testimonial.author}
                      </h4>
                      <p className="text-accent text-sm font-semibold">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 pointer-events-none transition-all duration-300"></div>
              </div>

              <div className="absolute top-0 left-0 w-1 h-1 bg-secondary rounded-full group-hover:h-8 transition-all duration-500 ml-6 -mt-3"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-6">Ready to join the community?</p>
          <button className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-slate-950 font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 transform">
            Start Playing Now
          </button>
        </div>
      </div>
    </section>
  );
}
