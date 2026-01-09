// app/components/GamesGrid.tsx
interface Game {
  id: number;
  name: string;
  category: string;
  players: number;
  image: string;
}

const games: Game[] = [
  {
    id: 1,
    name: "Chess Master",
    category: "Strategy",
    players: 2,
    image: "♟️",
  },
  {
    id: 2,
    name: "Puzzle Legends",
    category: "Puzzle",
    players: 1,
    image: "🧩",
  },
  {
    id: 3,
    name: "Battle Arena",
    category: "Action",
    players: 4,
    image: "⚔️",
  },
  {
    id: 4,
    name: "Word Quest",
    category: "Word",
    players: 1,
    image: "📝",
  },
];

export default function GamesGrid() {
  return (
    <section id="games" className="bg-slate-900 py-24 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Featured Games</h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Start playing our most popular games right now
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              {/* Game Image */}
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                {game.image}
              </div>

              {/* Game Info */}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span className="bg-purple-600 px-3 py-1 rounded-full">
                    {game.category}
                  </span>
                  <span>👥 {game.players}</span>
                </div>
              </div>

              {/* Play Button */}
              <button className="w-full bg-purple-600 hover:bg-purple-700 py-3 font-bold transition-colors">
                Play Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
