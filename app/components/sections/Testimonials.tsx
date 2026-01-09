"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "Feels like childhood, built for the future.",
    author: "Alex Chen",
    role: "Gaming Enthusiast",
    avatar: "AC",
  },
  {
    quote:
      "The smoothest gaming experience I've had online. Absolutely addictive!",
    author: "Sarah Martinez",
    role: "Competitive Player",
    avatar: "SM",
  },
  {
    quote: "Finally, a platform that respects my time and delivers pure fun.",
    author: "James Wilson",
    role: "Casual Gamer",
    avatar: "JW",
  },
  {
    quote: "The neon aesthetic combined with flawless gameplay is unmatched.",
    author: "Emma Rodriguez",
    role: "Game Designer",
    avatar: "ER",
  },
];

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    const handlers = new Map<
      HTMLDivElement,
      { onEnter: () => void; onLeave: () => void }
    >();

    const ctx = gsap.context(() => {
      gsap.from(cards, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        opacity: 0,
        x: (i) => (i % 2 === 0 ? -36 : 36),
        y: 16,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.1,
      });

      cards.forEach((card) => {
        const onEnter = () => {
          gsap.to(card, {
            y: -10,
            duration: 0.22,
            ease: "power2.out",
          });
          gsap.to(card, {
            boxShadow:
              "0 0 0 rgba(0,0,0,0), 0 40px 140px rgba(170,253,187,0.14)",
            duration: 0.22,
            ease: "power2.out",
          });
        };

        const onLeave = () => {
          gsap.to(card, {
            y: 0,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
            duration: 0.22,
            ease: "power2.out",
          });
        };

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
        handlers.set(card, { onEnter, onLeave });
      });
    }, containerRef);

    return () => {
      cards.forEach((card) => {
        const h = handlers.get(card);
        if (!h) return;
        card.removeEventListener("mouseenter", h.onEnter);
        card.removeEventListener("mouseleave", h.onLeave);
      });
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="testimonials"
      ref={containerRef}
      className="relative py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[24rem] w-[24rem] translate-x-1/3 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="400" height="400" filter="url(%23noiseFilter)" /%3E%3C/svg%3E")',
        }}
      ></div>

      <div className="absolute inset-0 -z-10 opacity-[0.08] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="n"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="400" height="400" filter="url(%23n)" /%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white">
            What Players <span className="text-secondary">Say</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-white/70 md:text-lg">
            Nostalgia hits harder when the experience feels next-gen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="group relative overflow-hidden rounded-3xl border border-primary/18 bg-black/25 p-8 transition-colors duration-300 hover:border-secondary/40"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col justify-between">
                <p className="text-lg leading-relaxed text-white/85 italic">
                  “{testimonial.quote}”
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-primary/15 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-r from-primary/35 to-secondary/30 text-sm font-black text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">
                        {testimonial.author}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-accent/90">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-black tracking-widest text-secondary">
                    ★★★★★
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
