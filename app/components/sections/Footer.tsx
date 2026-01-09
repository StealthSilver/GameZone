"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type Social = {
  name: string;
  href: string;
  icon: (props: { className?: string }) => JSX.Element;
};

const socials: Social[] = [
  {
    name: "X",
    href: "#",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M17.5 3H21l-7.6 8.7L22 21h-6.7l-5.3-6.1L4.5 21H1l8.2-9.4L2 3h6.8l4.8 5.6L17.5 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Discord",
    href: "#",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 18c2 1.2 8 1.2 10 0 1.1-2.4 1.6-5 1.7-7.7-1.4-1-2.8-1.6-4.2-2l-.4 1.1c-1.3-.3-2.8-.3-4.2 0l-.4-1.1c-1.4.4-2.8 1-4.2 2 .1 2.7.6 5.3 1.7 7.7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9.3 13.3h.1M14.6 13.3h.1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "#",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 19c-4 1.4-4-2-5-2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M15 22v-3.3c0-.9.3-1.5.8-2-2.7-.3-5.6-1.3-5.6-6 0-1.3.4-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4C18.9 2.9 19.9 3.2 19.9 3.2c.6 1.6.2 2.8.1 3.1.8.9 1.2 2 1.2 3.3 0 4.7-2.9 5.7-5.6 6 .5.4.8 1.2.8 2.3V22"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6.5 9.5V20M6.5 6.5h0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M10.5 20v-6.2c0-2 1.2-3.3 3-3.3s3 1.3 3 3.3V20"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 10.3V20"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(lineRef.current, {
        scaleX: 0,
        duration: 1.5,
        ease: "power2.inOut",
        transformOrigin: "left",
      });

      const icons = footerRef.current?.querySelectorAll(".social-icon");
      icons?.forEach((icon) => {
        icon.addEventListener("mouseenter", () => {
          gsap.to(icon, {
            scale: 1.2,
            color: "rgba(170, 253, 187, 1)",
            filter: "drop-shadow(0 0 18px rgba(170,253,187,0.35))",
            duration: 0.3,
            ease: "back.out",
          });
        });

        icon.addEventListener("mouseleave", () => {
          gsap.to(icon, {
            scale: 1,
            color: "rgba(108, 133, 234, 1)",
            filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",
            duration: 0.3,
            ease: "back.out",
          });
        });
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden border-t border-primary/15 py-14 md:py-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-56 right-0 h-[36rem] w-[36rem] translate-x-1/3 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="neon-divider">
          <div
            ref={lineRef}
            className="absolute inset-0 origin-left bg-gradient-to-r from-primary via-secondary to-accent"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl border border-primary/20 bg-black/30 shadow-[0_0_28px_rgba(108,133,234,0.18)]">
                <span className="text-sm font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  GZ
                </span>
              </span>
              <div>
                <div className="text-base font-black tracking-tight text-white">
                  The Game Zone
                </div>
                <div className="mt-1 text-sm font-semibold text-white/65">
                  Premium classics. Neon-dark polish.
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm font-semibold text-white/60">
              Built to feel next-gen — ready to extend into real game pages.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                className="social-icon grid size-11 place-items-center rounded-2xl border border-primary/18 bg-black/25 text-primary transition-colors hover:text-secondary"
                aria-label={s.name}
                title={s.name}
              >
                {s.icon({ className: "h-5 w-5" })}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-primary/12 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold text-white/55">
            © 2026 The Game Zone. All rights reserved.
          </p>
          <p className="text-xs font-semibold text-white/55">
            Crafted for smooth motion and subtle neon.
          </p>
        </div>
      </div>
    </footer>
  );
}
