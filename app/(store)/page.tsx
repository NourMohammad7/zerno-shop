import Image from "next/image";
import Link from "next/link";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";

// trim() срезает и невидимый BOM, если он попадёт в переменную окружения.
const CATALOG_PHOTOS = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()}/storage/v1/object/public/products/catalog`;

// Обложки категорий; для новой категории без обложки показывается иллюстрация.
const CATEGORY_ART: Record<string, { art: string; color: string; image?: string }> = {
  coffee: { art: "bag", color: "#b4532a", image: `${CATALOG_PHOTOS}/colombia-huila.jpg` },
  tea: { art: "tin", color: "#3f5b45", image: `${CATALOG_PHOTOS}/sencha.jpg` },
  brewing: { art: "kettle", color: "#4a5560", image: `${CATALOG_PHOTOS}/v60-dripper.jpg` },
  cups: { art: "cup", color: "#c9692f", image: `${CATALOG_PHOTOS}/ceramic-cup.jpg` },
};

const PERKS = [
  { title: "Обжарка каждую неделю", text: "Отправляем кофе не старше десяти дней после обжарки." },
  { title: "Доставка за 1–3 дня", text: "Курьером по городу или в пункт выдачи по всей стране." },
  { title: "Поможем выбрать", text: "Подскажем зерно под ваш способ заваривания и вкус." },
];

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: featured }, { count: productCount }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return (
    <>
      <section data-static-text className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden bg-ink text-paper md:items-center">
        <Image
          src="/hero-barista.jpg"
          alt="Бариста наливает молоко в чашку"
          fill
          priority
          sizes="100vw"
          className="kenburns -z-20 object-cover object-[30%_center]"
        />
        {/* Затемнение: снизу на телефоне, справа на компьютере — там, где текст. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/75 to-ink/10 md:bg-linear-to-l md:from-ink md:via-ink/80 md:to-transparent"
        />

        <div className="mx-auto w-full max-w-6xl px-5 pt-40 pb-14 md:py-24">
          <div className="md:ml-auto md:max-w-xl">
            <p className="fade-up inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/10 px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-paper uppercase backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Свежая обжарка каждую неделю
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.04] font-bold tracking-tight md:text-7xl">
              {["Хорошая", "чашка", "начинается"].map((word, i) => (
                <span key={word} className="fade-up mr-[0.25em] inline-block" style={{ "--d": `${120 + i * 90}ms` } as React.CSSProperties}>
                  {word}
                </span>
              ))}
              <span className="fade-up inline-block text-[#e8a87c] italic" style={{ "--d": "390ms" } as React.CSSProperties}>
                <span className="shimmer pr-[0.1em]" style={{ "--shine": "#fff4e6" } as React.CSSProperties}>
                  с зерна
                </span>
              </span>
            </h1>
            <p className="fade-up mt-6 max-w-md text-lg leading-relaxed text-paper/80" style={{ "--d": "520ms" } as React.CSSProperties}>
              Обжариваем небольшими партиями, подбираем чай у проверенных хозяйств и продаём
              только то, чем завариваем сами.
            </p>
            <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ "--d": "640ms" } as React.CSSProperties}>
              <Link href="/catalog" className="btn group/btn bg-accent hover:bg-paper hover:text-ink">
                Смотреть каталог
                <span className="transition-transform group-hover/btn:translate-x-1">→</span>
              </Link>
              <Link
                href="/catalog?category=coffee"
                className="btn-outline border-paper/40 text-paper hover:border-paper hover:bg-paper/10"
              >
                Выбрать кофе
              </Link>
            </div>
            <dl className="fade-up mt-10 flex gap-8 text-sm" style={{ "--d": "760ms" } as React.CSSProperties}>
              {[
                [String(productCount ?? 0), "товаров в каталоге"],
                ["1–3", "дня доставка"],
                ["10", "дней максимум от обжарки"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-bold">{value}</dt>
                  <dd className="mt-1 max-w-[8rem] text-paper/70">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div data-static-text className="overflow-hidden border-y border-ink bg-ink py-3.5 text-paper" aria-hidden>
        <div className="marquee flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {[
                "Свежая обжарка",
                "Листовой чай",
                "Доставка за 1–3 дня",
                "Оплата при получении",
                "Поможем выбрать зерно",
                "Посуда ручной работы",
              ].map((text) => (
                <span key={text} className="flex items-center gap-8 px-4 font-display text-lg whitespace-nowrap">
                  {text}
                  <span className="text-accent">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 pt-16 pb-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {((categories ?? []) as Category[]).map((category) => {
            const look = CATEGORY_ART[category.slug] ?? { art: "bag", color: "#b4532a" };
            return (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="reveal panel group flex items-center gap-3 p-3 transition duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-lg hover:shadow-ink/10"
              >
                <ProductArt
                  art={look.art}
                  color={look.color}
                  imageUrl={look.image}
                  name={category.name}
                  className="w-16 shrink-0 rounded-xl"
                />
                <span className="font-semibold group-hover:text-accent">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="reveal flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Выбор недели</h2>
          <Link href="/catalog" className="text-sm font-semibold text-accent underline underline-offset-4">
            Весь каталог
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {((featured ?? []) as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="reveal panel p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/50"
            >
              <h3 className="font-display text-xl font-semibold">{perk.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{perk.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
