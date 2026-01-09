"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Games", href: "#games" },
  { name: "Features", href: "#features" },
  { name: "Community", href: "#community" },
  { name: "Testimonials", href: "#testimonials" },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export default function Header() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const headerClassName = useMemo(() => {
    return [
      "fixed top-0 left-0 right-0 z-50",
      "transition-[background,box-shadow] duration-300",
      isScrolled
        ? [
            "bg-black/50 backdrop-blur-md",
            "shadow-[0_12px_60px_rgba(108,133,234,0.14)]",
            "border-b border-primary/15",
          ].join(" ")
        : "bg-transparent",
    ].join(" ");
  }, [isScrolled]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      linkRefs.current.forEach((el) => {
        if (!el) return;

        const onEnter = () => {
          gsap.to(el, {
            y: -2,
            duration: 0.18,
            ease: "power2.out",
          });
          gsap.to(el, {
            textShadow: "0 0 18px rgba(170,253,187,0.35)",
            duration: 0.18,
            ease: "power2.out",
          });
        };

        const onLeave = () => {
          gsap.to(el, {
            y: 0,
            duration: 0.18,
            ease: "power2.out",
          });
          gsap.to(el, {
            textShadow: "0 0 0px rgba(170,253,187,0)",
            duration: 0.18,
            ease: "power2.out",
          });
        };

        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);

        (el as any).__tgzEnter = onEnter;
        (el as any).__tgzLeave = onLeave;
      });
    }, headerRef);

    return () => {
      linkRefs.current.forEach((el) => {
        if (!el) return;
        const onEnter = (el as any).__tgzEnter as
          | ((ev: Event) => void)
          | undefined;
        const onLeave = (el as any).__tgzLeave as
          | ((ev: Event) => void)
          | undefined;
        if (onEnter) el.removeEventListener("mouseenter", onEnter);
        if (onLeave) el.removeEventListener("mouseleave", onLeave);
        delete (el as any).__tgzEnter;
        delete (el as any).__tgzLeave;
      });
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileOpen]);

  return (
    <header ref={headerRef} className={headerClassName}>
      <nav className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-3"
            aria-label="The Game Zone"
            onClick={() => setIsMobileOpen(false)}
          >
            <span className="grid size-9 place-items-center rounded-xl border border-primary/25 bg-black/30 shadow-[0_0_28px_rgba(108,133,234,0.22)]">
              <span className="text-lg font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                GZ
              </span>
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                The Game Zone
              </span>
              <span className="block text-xs text-white/70">
                Classic games, premium energy.
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                ref={(el) => {
                  linkRefs.current[index] = el;
                }}
                className="relative text-sm font-semibold tracking-wide text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.name}
                <span className="pointer-events-none absolute -bottom-2 left-0 h-[2px] w-0 bg-gradient-to-r from-primary via-secondary to-accent transition-[width] duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-primary/20 bg-black/30 px-3 py-2 shadow-[0_0_24px_rgba(108,133,234,0.18)]"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen((v) => !v)}
          >
            <span className="relative block h-5 w-6">
              <span
                className={[
                  "absolute left-0 top-1 block h-[2px] w-6 rounded bg-primary transition-transform duration-200",
                  isMobileOpen ? "translate-y-2 rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute left-0 top-1/2 block h-[2px] w-6 -translate-y-1/2 rounded bg-secondary transition-opacity duration-200",
                  isMobileOpen ? "opacity-0" : "opacity-100",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute left-0 bottom-1 block h-[2px] w-6 rounded bg-accent transition-transform duration-200",
                  isMobileOpen ? "-translate-y-2 -rotate-45" : "",
                ].join(" ")}
              />
            </span>
          </button>
        </div>

        <div
          className={[
            "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300",
            isMobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="mt-4 rounded-2xl border border-primary/15 bg-black/35 backdrop-blur-md shadow-[0_24px_70px_rgba(108,133,234,0.12)]">
            <div className="flex flex-col p-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-white/85 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
