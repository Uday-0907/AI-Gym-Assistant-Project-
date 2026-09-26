import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import FloatingGymBuddy from "@/components/FloatingGymBuddy";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseAi",
  description: "PulseAi — Personalized Computer Vision Workout Tracking, Nutrition & Biomechanics Analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-[var(--bg-base)] text-[var(--text-primary)]">
        {children}
        <FloatingGymBuddy />
      </body>
    </html>
  );
}
