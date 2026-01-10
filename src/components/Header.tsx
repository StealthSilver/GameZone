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
        <button className="relative px-8 py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.8)] transform hover:scale-105">
          Play Now
        </button>
      </div>
    </header>
  );
};
