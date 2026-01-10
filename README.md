# 🎮 The Game Zone

**Classic Games. Modern Energy.**

A premium, dark-themed gaming platform where nostalgia meets innovation. Experience timeless games reimagined with cutting-edge design and smooth animations.

![The Game Zone](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)
![GSAP](https://img.shields.io/badge/GSAP-Latest-88CE02?style=for-the-badge&logo=greensock)

## 🎨 Color Theme

The entire UI is built with a strict three-color neon palette:

- **Primary**: `#6C85EA` (Electric Blue / Indigo)
- **Secondary**: `#AAFDBB` (Soft Neon Mint)
- **Accent**: `#E9FA00` (Vibrant Neon Yellow)

## ✨ Features

- ⚡ **Instant Play** - Zero downloads, browser-based gaming
- 🎮 **8 Classic Games** - Snake, Chess, Carrom, Go, Tetris, Pool, Tic Tac Toe, Snake and Ladder
- 🌙 **Dark Neon Interface** - Eye-friendly with vibrant accents
- 🎬 **GSAP Animations** - Smooth scroll-triggered animations and micro-interactions
- 📱 **Fully Responsive** - Mobile-first design, desktop-polished
- 🧠 **Skill-Based Gameplay** - Strategic thinking meets competitive edge

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: GSAP (with ScrollTrigger)
- **Font**: Geist Sans & Geist Mono

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd GameZone
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
GameZone/
├── src/
│   ├── app/
│   │   ├── globals.css       # Global styles & theme
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   └── components/
│       ├── Navbar.tsx         # Sticky navigation with blur effect
│       ├── Hero.tsx           # Animated hero section
│       ├── Features.tsx       # Feature cards with hover animations
│       ├── GamesGrid.tsx      # 8-game grid with staggered reveal
│       ├── Testimonials.tsx   # User testimonials
│       └── Footer.tsx         # Footer with social links
├── public/                    # Static assets
└── package.json
```

## 🎯 Component Highlights

### Navbar

- Sticky header with scroll-based backdrop blur
- Smooth scroll-to-section navigation
- Neon glow effects on scroll

### Hero

- Bold headline with gradient text
- Animated floating game icons
- Dual CTA buttons with hover effects
- Grid background with gradient orbs

### Features

- 4 feature cards with lift & glow animations
- Border pulse on hover
- Staggered scroll reveal

### Games Grid

- 8 game cards with unique icons
- Scale, glow, and rotation on hover
- GSAP staggered entrance animations
- "Play Now" button appears on hover

### Testimonials

- 3 user testimonial cards
- Neon borders with noise texture
- Sliding entrance animations

### Footer

- Animated divider line
- Social icon hover glows
- Newsletter signup
- Gradient background

## 🎨 Custom CSS Utilities

```css
.text-gradient-primary   /* Blue to Mint gradient */
/* Blue to Mint gradient */
.text-gradient-secondary /* Mint to Yellow gradient */
.text-gradient-full      /* Full spectrum gradient */
.glow-primary            /* Blue glow shadow */
.glow-secondary          /* Mint glow shadow */
.glow-accent; /* Yellow glow shadow */
```

## 📱 Responsive Design

- **Mobile**: Optimized touch interactions, stacked layouts
- **Tablet**: 2-column grids, adjusted spacing
- **Desktop**: Full 4-column layouts, enhanced animations

## 🎬 Animation Patterns

- **Entrance**: Fade + slide + scale
- **Scroll Trigger**: Elements animate as they enter viewport
- **Hover**: Lift, glow, rotate, scale transformations
- **Stagger**: Sequential reveals for card grids
- **Continuous**: Floating particles, pulsing orbs

## 🔮 Future Enhancements

- [ ] Implement actual game logic for each game
- [ ] Add multiplayer functionality
- [ ] User authentication & profiles
- [ ] Leaderboards & achievements
- [ ] Game statistics & analytics
- [ ] Dark/Light theme toggle (currently dark only)
- [ ] More games (Sudoku, Minesweeper, etc.)

## 📝 Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Design inspiration from modern gaming platforms
- GSAP for incredible animation capabilities
- Next.js team for the amazing framework
- Tailwind CSS for rapid styling

---

Made with ⚡ by passionate gamers | © 2026 The Game Zone
