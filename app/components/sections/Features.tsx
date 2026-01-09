// app/components/Features.tsx
interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "🎮",
    title: "Diverse Games",
    description: "Play hundreds of games across different genres",
  },
  {
    icon: "👥",
    title: "Multiplayer",
    description: "Challenge friends and players worldwide",
  },
  {
    icon: "🏆",
    title: "Tournaments",
    description: "Compete in tournaments and win real rewards",
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Optimized for smooth gameplay",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-slate-900">
          Why GameZone?
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          We provide the best gaming experience with world-class features
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-slate-50 rounded-xl hover:shadow-lg hover:bg-slate-100 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
