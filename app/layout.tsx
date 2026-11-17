import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { TEXT_REVEAL_SCRIPT } from "@/lib/text-reveal";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Зерно — кофе, чай и всё для заваривания",
    template: "%s — Зерно",
  },
  description:
    "Интернет-магазин свежеобжаренного кофе, листового чая и аксессуаров для заваривания.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Анимация текста магазина: запускается до React, чтобы текст не ждал загрузки JS. */}
        <script dangerouslySetInnerHTML={{ __html: TEXT_REVEAL_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
