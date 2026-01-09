"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Game = {
  name: string;
  icon: (props: { className?: string }) => ReactNode;
};

const baseIconClass = "h-10 w-10 md:h-12 md:w-12";

const games: Game[] = [
  {
    name: "Snake",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 48 48"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 30c2-8 10-14 18-14 7 0 10 4 10 8 0 6-6 10-14 10-6 0-10 3-12 8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M36 16h2"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Chess",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 48 48"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 40h16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M18 40c0-8 3-10 3-14 0-3-2-5-2-8 0-3 3-6 5-6s5 3 5 6c0 3-2 5-2 8 0 4 3 6 3 14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Carrom",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 48 48"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="11"
          y="11"
          width="26"
          height="26"
          rx="6"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M24 16v16M16 24h16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="24" cy="24" r="3" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
  {
    name: "Go",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 48 48"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 16h16M16 24h16M16 32h16M20 16v16M28 16v16"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="30" cy="22" r="4" fill="currentColor" opacity="0.9" />
      </svg>
    ),
  },
  {
    name: "Tetris",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 48 48"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14 18h10v10H14V18Zm10 0h10v10H24V18Zm0 10h10v10H24V28Zm-10 0h10v10H14V28Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Pool",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 48 48"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <circle cx="20" cy="26" r="10" stroke="currentColor" strokeWidth="3" />
        <path
          d="M28 18l14-14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M33 9l6 6"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Tic Tac Toe",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 48 48"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 12v24M32 12v24M12 16h24M12 32h24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M17 17l8 8M25 17l-8 8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    ),
  },
  {
    name: "Snake and Ladder",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 48 48"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14 36V14h8v22h-8Zm12 0V12h8v24h-8Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M14 20h8M14 26h8M26 18h8M26 24h8M26 30h8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function GameGrid() {
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
        y: 34,
        rotate: 0.8,
        scale: 0.98,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.08,
      });

      cards.forEach((card) => {
        const icon = card.querySelector("[data-icon]");

        const onEnter = () => {
          gsap.to(card, {
            y: -12,
            rotate: -0.6,
            scale: 1.02,
            duration: 0.22,
            ease: "power2.out",
          });
          gsap.to(card, {
            boxShadow:
              "0 0 0 rgba(0,0,0,0), 0 40px 140px rgba(108,133,234,0.22)",
            duration: 0.22,
            ease: "power2.out",
          });
          if (icon) {
            gsap.to(icon, {
              rotate: 6,
              scale: 1.06,
              duration: 0.22,
              ease: "power2.out",
            });
          }
        };

        const onLeave = () => {
          gsap.to(card, {
            y: 0,
            rotate: 0,
            scale: 1,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
            duration: 0.22,
            ease: "power2.out",
          });
          if (icon) {
            gsap.to(icon, {
              rotate: 0,
              scale: 1,
              duration: 0.22,
              ease: "power2.out",
            });
          }
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
    <section id="games" ref={containerRef} className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[30rem] w-[30rem] translate-x-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-48 left-0 h-[34rem] w-[34rem] -translate-x-1/3 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Featured <span className="text-secondary">Games</span>
          </h2>
          <p className="mt-4 text-base text-white/70 md:text-lg">
            A sleek grid of classics — animated, polished, and ready to extend.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game, index) => (
            <a
              key={game.name}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              href="#"
              className={[
                "group relative overflow-hidden rounded-3xl border border-primary/18 bg-black/25 p-7 md:p-8",
                "transition-colors duration-300 hover:border-secondary/40",
              ].join(" ")}
              aria-label={`Open ${game.name}`}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    data-icon
                    className="grid size-14 place-items-center rounded-2xl border border-primary/18 bg-black/25 text-primary transition-colors duration-300 group-hover:text-secondary"
                  >
                    {game.icon({ className: baseIconClass })}
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-widest text-white/55">
                      GAME
                    </div>
                    <div className="mt-1 text-lg font-black tracking-tight text-white">
                      {game.name}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-black tracking-widest text-accent/90">
                  PLAY
                </div>
              </div>

              <div className="mt-6 h-1 rounded-full bg-gradient-to-r from-primary/60 via-secondary/60 to-accent/60 opacity-35 transition-opacity duration-300 group-hover:opacity-70" />
              <div className="mt-4 text-sm font-semibold text-white/65">
                Hover for neon motion. Click to extend later.
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
