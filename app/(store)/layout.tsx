import Link from "next/link";
import { CartLink } from "@/components/CartLink";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/catalog?category=coffee", label: "Кофе" },
  { href: "/catalog?category=tea", label: "Чай" },
  { href: "/catalog?category=brewing", label: "Заваривание" },
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
          <Link href="/" className="fade-down font-display text-2xl font-bold tracking-tight">
            Зерно<span className="text-accent">.</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold sm:flex">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="fade-down nav-link hover:text-accent"
                style={delay(80 + i * 70)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="fade-down flex items-center gap-4" style={delay(380)}>
            <Link href="/catalog" className="nav-link text-sm font-semibold sm:hidden">Каталог</Link>
            <CartLink />
          </div>
        </div>
      </header>

      <main className="flex-1" data-animate-text>
        {children}
      </main>

      <footer className="mt-24 border-t border-line" data-animate-text>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-xl font-bold text-ink">
              Зерно<span className="text-accent">.</span>
            </div>
            <p className="mt-1">Свежая обжарка, листовой чай и всё для заваривания.</p>
            <p className="mt-1 text-xs">
              Фото:{" "}
              <a href="https://unsplash.com" className="underline underline-offset-2 hover:text-ink" target="_blank" rel="noreferrer">
                Unsplash
              </a>
            </p>
          </div>
          <div className="flex gap-6 font-semibold">
            <Link href="/catalog" className="nav-link hover:text-ink">Каталог</Link>
            <Link href="/cart" className="nav-link hover:text-ink">Корзина</Link>
            <Link href="/admin" className="nav-link hover:text-ink">Админ-панель</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
