"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugin on the client side only
gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "Feels like childhood, built for the future.",
    author: "Alex Chen",
    role: "Competitive Gamer",
    gradient: "from-[#6C85EA] to-[#AAFDBB]",
  },
  {
    quote: "The perfect blend of nostalgia and innovation. I'm hooked!",
    author: "Sarah Martinez",
    role: "Game Designer",
    gradient: "from-[#AAFDBB] to-[#E9FA00]",
  },
  {
    quote:
      "Finally, classic games that don't feel outdated. Absolutely brilliant.",
    author: "Marcus Johnson",
    role: "Retro Gaming Enthusiast",
    gradient: "from-[#E9FA00] to-[#6C85EA]",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          {
            x: -100,
            opacity: 0,
            rotateY: -30,
          },
          {
            x: 0,
            opacity: 1,
            rotateY: 0,
            duration: 1,
            stagger: 0.25,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 70%",
              end: "bottom 30%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative py-20 sm:py-24 lg:py-32 bg-black overflow-hidden"
    >
      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#6C85EA]/20 to-transparent rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6">
            What Players{" "}
            <span className="bg-gradient-to-r from-[#AAFDBB] to-[#E9FA00] bg-clip-text text-transparent">
              Say
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Join thousands of gamers rediscovering their favorite classics
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-transparent hover:border-[#6C85EA] transition-all duration-500 cursor-pointer overflow-hidden"
              style={{
                perspective: "1000px",
              }}
            >
              {/* Neon Border Glow */}
              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${testimonial.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}
              ></div>

              {/* Quote Mark */}
              <div
                className={`text-8xl font-bold bg-gradient-to-r ${testimonial.gradient} bg-clip-text text-transparent opacity-20 leading-none mb-6`}
              >
                "
              </div>

              {/* Quote Text */}
              <p className="text-2xl text-white font-medium mb-8 leading-relaxed relative z-10 group-hover:text-white/90 transition-colors duration-300">
                {testimonial.quote}
              </p>

              {/* Author Info */}
              <div className="relative z-10">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-2xl font-bold text-black shadow-[0_0_20px_rgba(108,133,234,0.5)] group-hover:shadow-[0_0_30px_rgba(108,133,234,0.8)] transition-all duration-500`}
                  >
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-[#6C85EA] transition-colors duration-300">
                      {testimonial.author}
                    </h4>
                    <p className="text-sm text-white/60">{testimonial.role}</p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div
                className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${testimonial.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-500`}
              ></div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#6C85EA] rounded-tr-3xl opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#AAFDBB] rounded-bl-3xl opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
