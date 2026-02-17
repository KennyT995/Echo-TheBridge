import { Inter, Space_Grotesk, Geist } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  variable: "--font-space-grotesk",
});
