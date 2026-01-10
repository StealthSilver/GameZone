import React from "react";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="w-full h-[8vh] min-h-[60px] bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/game.svg"
            alt="GameZone Logo"
            width={30}
            height={30}
            className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9"
          />
          <span className="ml-2 sm:ml-3 text-white text-lg sm:text-xl md:text-2xl font-bold font-[family-name:var(--font-oxanium)]">
            GameZone
          </span>
        </div>

        {/* Play Now Button */}
        <button className="group relative px-3 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 text-black font-bold text-xs sm:text-sm rounded-md sm:rounded-lg bg-gradient-to-br from-[#AAFDBB] via-[#8CECF7] to-[#6C85EA] hover:from-[#6C85EA] hover:via-[#8CECF7] hover:to-[#AAFDBB] transition-all duration-700 transform hover:-translate-y-1 hover:rotate-1 active:scale-95 active:rotate-0 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white after:to-transparent after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-1000">
          <span className="relative z-10 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            PLAY NOW
          </span>
        </button>
      </div>
    </header>
  );
};
