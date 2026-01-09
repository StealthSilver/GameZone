"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function usePrefersReducedMotion() {
  const reduced = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      reduced.current = media.matches;
    };
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [usePrefersReducedMotion]);

  return reduced;
}

function Icon({ label }: { label: string }) {
  return (
    <span className="grid size-10 place-items-center rounded-2xl border border-primary/20 bg-black/30 text-white/90 shadow-[0_0_30px_rgba(108,133,234,0.12)]">
      <span className="text-sm font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        {label}
      </span>
    </span>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const floatersRef = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const floaters = useMemo(
    () => [
      { label: "SNA", top: "18%", left: "10%" },
      { label: "CHS", top: "28%", left: "84%" },
      { label: "TET", top: "70%", left: "14%" },
      { label: "TTT", top: "76%", left: "82%" },
      { label: "GO", top: "52%", left: "92%" },
    ],
    []
  );

  useEffect(() => {
    let cleanupPointer: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const reduce = prefersReducedMotion.current;

      if (!reduce) {
        gsap.from([titleRef.current, subtitleRef.current, ctaRef.current], {
          opacity: 0,
          y: 22,
          scale: 0.98,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.12,
          delay: 0.15,
        });

        gsap.to(gridRef.current, {
          y: -16,
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        floatersRef.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            y: i % 2 === 0 ? -18 : 18,
            x: i % 3 === 0 ? 10 : -10,
            duration: 3.2 + i * 0.35,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.7,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.to(floatersRef.current, {
              rotate: p * 2,
              duration: 0.2,
              overwrite: "auto",
            });
          },
        });
      }

      const el = containerRef.current;
      if (!el || reduce) return;

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const dx = (e.clientX - rect.left) / rect.width - 0.5;
        const dy = (e.clientY - rect.top) / rect.height - 0.5;

        floatersRef.current.forEach((node, idx) => {
          if (!node) return;
          gsap.to(node, {
            x: dx * (18 + idx * 4),
            y: dy * (18 + idx * 3),
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      };

      el.addEventListener("pointermove", onMove);
      cleanupPointer = () => el.removeEventListener("pointermove", onMove);
    }, containerRef);

    return () => {
      cleanupPointer?.();
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen overflow-hidden pt-24"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-3xl animate-blob" />
        <div className="absolute top-8 right-1/4 h-[30rem] w-[30rem] rounded-full bg-secondary/14 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/4 h-[36rem] w-[36rem] rounded-full bg-accent/12 blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div
        ref={gridRef}
        className="neon-grid absolute inset-0 -z-10 opacity-25"
      />

      {floaters.map((f, idx) => (
        <div
          key={f.label}
          ref={(el) => {
            floatersRef.current[idx] = el;
          }}
          className="pointer-events-none absolute -z-0"
          style={{ top: f.top, left: f.left }}
        >
          <Icon label={f.label} />
        </div>
      ))}

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1
              ref={titleRef}
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight"
            >
              <span className="block text-white">Classic Games.</span>
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Modern Energy.
              </span>
            </h1>

            <p
              ref={subtitleRef}
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-xl"
            >
              A sleek, multiplayer-ready hub for timeless classics — rebuilt
              with a premium dark-neon interface, smooth input, and
              lightning-fast matchmaking vibes.
            </p>

            <div ref={ctaRef} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#games"
                className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent px-7 py-4 text-sm font-black tracking-wide text-black shadow-[0_0_50px_rgba(108,133,234,0.22)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Play Now
                <span className="ml-2 inline-block opacity-80 transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </a>

              <a
                href="#games"
                className="inline-flex items-center justify-center rounded-2xl border border-primary/35 bg-black/30 px-7 py-4 text-sm font-black tracking-wide text-white shadow-[0_0_40px_rgba(108,133,234,0.10)] transition-colors hover:bg-white/5"
              >
                Explore Games
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-primary/15 bg-black/25 px-4 py-4">
                <div className="text-lg font-black text-secondary">8</div>
                <div className="mt-1 text-xs font-semibold text-white/65">
                  Classic titles
                </div>
              </div>
              <div className="rounded-2xl border border-primary/15 bg-black/25 px-4 py-4">
                <div className="text-lg font-black text-primary">1v1</div>
                <div className="mt-1 text-xs font-semibold text-white/65">
                  Battle-ready
                </div>
              </div>
              <div className="rounded-2xl border border-primary/15 bg-black/25 px-4 py-4">
                <div className="text-lg font-black text-accent">0</div>
                <div className="mt-1 text-xs font-semibold text-white/65">
                  Downloads
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-3xl border border-primary/15 bg-black/30 p-6 shadow-[0_35px_120px_rgba(108,133,234,0.18)]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black tracking-widest text-white/60">
                    LIVE LOBBIES
                  </div>
                  <div className="text-xs font-black tracking-widest text-accent/90">
                    READY
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { game: "Chess", tag: "Ranked" },
                    { game: "Snake", tag: "Arcade" },
                    { game: "Tetris", tag: "Sprint" },
                  ].map((row) => (
                    <div
                      key={row.game}
                      className="flex items-center justify-between rounded-2xl border border-primary/12 bg-black/35 px-4 py-4"
                    >
                      <div>
                        <div className="text-sm font-black text-white">
                          {row.game}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-white/60">
                          {row.tag}
                        </div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-r from-primary to-secondary px-3 py-2 text-xs font-black text-black">
                        Join
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 text-xs font-semibold text-white/60">
                  Smooth animations, neon polish, and zero clutter.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
