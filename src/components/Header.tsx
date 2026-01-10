import React from "react";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="w-full bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/game.svg"
            alt="GameZone Logo"
            width={30}
            height={30}
            className="w-9 h-9"
          />
          <span className="ml-3 text-white text-2xl font-bold">GameZone</span>
        </div>

        {/* Play Now Button */}
        <button className="group relative px-6 py-2.5 text-white font-bold text-sm rounded-lg bg-gradient-to-br from-[#AAFDBB] to-[#6C85EA] hover:from-[#6C85EA] hover:to-[#AAFDBB] transition-all duration-700 shadow-[0_0_20px_rgba(170,253,187,0.6),0_0_40px_rgba(108,133,234,0.4)] hover:shadow-[0_0_30px_rgba(170,253,187,0.9),0_0_60px_rgba(108,133,234,0.7)] transform hover:-translate-y-1 hover:rotate-1 active:scale-95 active:rotate-0 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white after:to-transparent after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-1000">
          <span className="relative z-10 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            PLAY NOW
          </span>
        </button>
      </div>
    </header>
  );
};
