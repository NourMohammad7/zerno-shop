import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { TEXT_FLOAT_SCRIPT } from "@/lib/text-float";
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
    <html lang="ru" className={`${manrope.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        {/* Плавающие надписи магазина: запускаются до React, не дожидаясь загрузки JS. */}
        <script dangerouslySetInnerHTML={{ __html: TEXT_FLOAT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
