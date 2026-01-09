// app/components/Hero.tsx
export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            GameZone
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-8">
          The ultimate platform to play amazing games, connect with friends, and
          compete in tournaments.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <button className="px-8 py-4 bg-purple-600 rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg">
            Play Now
          </button>
          <button className="px-8 py-4 border-2 border-purple-400 rounded-lg font-bold text-lg hover:bg-purple-400 hover:text-slate-900 transition-colors">
            Explore Games
          </button>
        </div>
      </div>
    </section>
  );
}
