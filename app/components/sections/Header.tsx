// app/components/Header.tsx
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          🎮 GameZone
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-8">
          <a href="#games" className="hover:text-purple-400 transition-colors">
            Games
          </a>
          <a
            href="#features"
            className="hover:text-purple-400 transition-colors"
          >
            Features
          </a>
          <a href="#about" className="hover:text-purple-400 transition-colors">
            About
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
            Sign In
          </button>
          <button className="px-6 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
