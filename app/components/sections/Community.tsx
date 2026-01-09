"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Community() {
  const containerRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = itemsRef.current.filter(Boolean) as HTMLDivElement[];

      gsap.from(items, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        opacity: 0,
        y: 26,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.08,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="community"
      ref={containerRef}
      className="relative py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/3 h-[26rem] w-[26rem] -translate-x-1/3 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-[22rem] w-[22rem] translate-x-1/3 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Built for <span className="text-primary">Community</span>
          </h2>
          <p className="mt-4 text-base text-white/70 md:text-lg">
            Friendly lobbies, clean matchmaking vibes, and a premium interface
            that stays out of your way.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "1v1 & casual",
              body: "Challenge friends or queue up for a quick session.",
              tone: "text-secondary",
            },
            {
              title: "Skill-first",
              body: "Smooth input + clean UI that rewards focus.",
              tone: "text-primary",
            },
            {
              title: "Season-ready",
              body: "Leaderboards and tournaments are easy to plug in later.",
              tone: "text-accent",
            },
          ].map((c, i) => (
            <div
              key={c.title}
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              className="group relative overflow-hidden rounded-3xl border border-primary/18 bg-black/25 p-7 transition-colors duration-300 hover:border-secondary/40"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-secondary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className={`text-xs font-black tracking-widest ${c.tone}`}>
                  COMMUNITY
                </div>
                <div className="mt-2 text-xl font-black tracking-tight text-white">
                  {c.title}
                </div>
                <div className="mt-3 text-sm font-semibold text-white/65">
                  {c.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href="#games"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent px-8 py-4 text-sm font-black tracking-wide text-black shadow-[0_0_55px_rgba(170,253,187,0.18)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Join the Zone
          </a>
        </div>
      </div>
    </section>
  );
}
