'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(lineRef.current, {
        scaleX: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        transformOrigin: 'left',
      });

      const icons = footerRef.current?.querySelectorAll('.social-icon');
      icons?.forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, {
            scale: 1.2,
            color: 'rgba(170, 253, 187, 1)',
            duration: 0.3,
            ease: 'back.out',
          });
        });

        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, {
            scale: 1,
            color: 'rgba(108, 133, 234, 1)',
            duration: 0.3,
            ease: 'back.out',
          });
        });
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative border-t border-primary/20 bg-gradient-to-b from-slate-900 to-slate-950 py-12 md:py-16 px-4 md:px-6 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent">
        <div
          ref={lineRef}
          className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent"
          style={{ scaleX: 0 }}
        ></div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-3 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎮</span>
              <div>
                <h3 className="text-lg font-bold text-white">The Game Zone</h3>
                <p className="text-xs text-secondary">Play. Connect. Win.</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The ultimate platform for classic gaming with a modern twist.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-primary">Games</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Browse All
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  New Releases
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Tournaments
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Leaderboards
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-primary">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-primary">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-secondary transition-colors duration-300">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-8 mb-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © 2026 The Game Zone. All rights reserved. Built with ❤️ and code.
          </p>

          <div className="flex gap-6">
            {[
              { name: 'Twitter', symbol: '��' },
              { name: 'Discord', symbol: '💬' },
              { name: 'GitHub', symbol: '🐙' },
              { name: 'LinkedIn', symbol: '💼' },
            ].map((social) => (
              <a
                key={social.name}
                href="#"
                className="social-icon text-2xl text-primary hover:text-secondary transition-all duration-300 transform hover:scale-110"
                title={social.name}
              >
                {social.symbol}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
