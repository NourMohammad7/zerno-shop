import Link from "next/link";
import { CartLink } from "@/components/CartLink";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            Зерно<span className="text-accent">.</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold sm:flex">
            <Link href="/catalog" className="hover:text-accent">Каталог</Link>
            <Link href="/catalog?category=coffee" className="hover:text-accent">Кофе</Link>
            <Link href="/catalog?category=tea" className="hover:text-accent">Чай</Link>
            <Link href="/catalog?category=brewing" className="hover:text-accent">Заваривание</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/catalog" className="text-sm font-semibold sm:hidden">Каталог</Link>
            <CartLink />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-xl font-bold text-ink">
              Зерно<span className="text-accent">.</span>
            </div>
            <p className="mt-1">Свежая обжарка, листовой чай и всё для заваривания.</p>
          </div>
          <div className="flex gap-6 font-semibold">
            <Link href="/catalog" className="hover:text-ink">Каталог</Link>
            <Link href="/cart" className="hover:text-ink">Корзина</Link>
            <Link href="/admin" className="hover:text-ink">Админ-панель</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
