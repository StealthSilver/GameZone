'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const games = [
  { name: 'Snake', emoji: '🐍', players: '2M+' },
  { name: 'Chess', emoji: '♟️', players: '5M+' },
  { name: 'Carrom', emoji: '🎯', players: '1.2M+' },
  { name: 'Go', emoji: '⚫', players: '800K+' },
  { name: 'Tetris', emoji: '🧱', players: '3.5M+' },
  { name: 'Pool', emoji: '��', players: '2.3M+' },
  { name: 'Tic Tac Toe', emoji: '⭕', players: '4.1M+' },
  { name: 'Snakes & Ladder', emoji: '🎲', players: '1.8M+' },
];

export default function GameGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.5,
          },
          opacity: 0,
          y: 40,
          scale: 0.9,
          duration: 0.8,
        });

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -15,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(card.querySelector('.game-emoji'), {
            scale: 1.3,
            duration: 0.3,
            ease: 'back.out',
          });
          gsap.to(card.querySelector('.game-border'), {
            borderColor: 'rgba(170, 253, 187, 1)',
            duration: 0.3,
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(card.querySelector('.game-emoji'), {
            scale: 1,
            duration: 0.3,
            ease: 'back.out',
          });
          gsap.to(card.querySelector('.game-border'), {
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
      id="games"
      ref={containerRef}
      className="relative py-24 md:py-32 px-4 md:px-6 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-5 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Featured <span className="text-secondary">Games</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Choose from our collection of classic and modern games
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="group relative rounded-xl overflow-hidden"
            >
              <div
                className="game-border relative p-6 md:p-8 h-full flex flex-col items-center justify-center text-center rounded-xl border-2 transition-all duration-300"
                style={{ borderColor: 'rgba(108, 133, 234, 0.3)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-slate-900 to-slate-950 group-hover:from-primary/10 transition-all duration-300"></div>

                <div className="relative z-10 space-y-4">
                  <div className="game-emoji text-6xl md:text-7xl transition-transform duration-300 transform origin-center">
                    {game.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-secondary transition-colors duration-300">
                      {game.name}
                    </h3>
                    <p className="text-accent text-sm md:text-base font-semibold">
                      {game.players} Playing
                    </p>
                  </div>

                  <button className="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-slate-950 font-bold rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    Play Now
                  </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 pointer-events-none transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
