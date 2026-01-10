import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "The Game Zone - Classic Games, Modern Energy",
  description:
    "Experience nostalgic gameplay reimagined with cutting-edge design. Play Snake, Chess, Carrom, Go, Tetris, Pool, Tic Tac Toe, and Snake and Ladder with a premium, polished interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oxanium.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
