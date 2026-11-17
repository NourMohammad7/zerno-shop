import Link from "next/link";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";

const CATEGORY_ART: Record<string, { art: string; color: string }> = {
  coffee: { art: "bag", color: "#b4532a" },
  tea: { art: "tin", color: "#3f5b45" },
  brewing: { art: "kettle", color: "#4a5560" },
  cups: { art: "cup", color: "#c9692f" },
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
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="drift absolute -top-32 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          <div
            className="drift absolute top-40 right-0 h-80 w-80 rounded-full bg-leaf/15 blur-3xl"
            style={{ "--d": "-6s" } as React.CSSProperties}
          />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-14 pb-20 md:grid-cols-[1.15fr_1fr] md:pt-20">
          <div>
            <p className="fade-up inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-accent uppercase backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Свежая обжарка каждую неделю
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.04] font-bold tracking-tight md:text-7xl">
              {["Хорошая", "чашка", "начинается"].map((word, i) => (
                <span key={word} className="fade-up mr-[0.25em] inline-block" style={{ "--d": `${120 + i * 90}ms` } as React.CSSProperties}>
                  {word}
                </span>
              ))}
              <span className="fade-up inline-block italic text-accent" style={{ "--d": "390ms" } as React.CSSProperties}>
                с зерна
              </span>
            </h1>
            <p className="fade-up mt-6 max-w-md text-lg leading-relaxed text-muted" style={{ "--d": "520ms" } as React.CSSProperties}>
              Обжариваем небольшими партиями, подбираем чай у проверенных хозяйств и продаём
              только то, чем завариваем сами.
            </p>
            <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ "--d": "640ms" } as React.CSSProperties}>
              <Link href="/catalog" className="btn group/btn">
                Смотреть каталог
                <span className="transition-transform group-hover/btn:translate-x-1">→</span>
              </Link>
              <Link href="/catalog?category=coffee" className="btn-outline">Выбрать кофе</Link>
            </div>
            <dl className="fade-up mt-10 flex gap-8 text-sm" style={{ "--d": "760ms" } as React.CSSProperties}>
              {[
                [String(productCount ?? 0), "товаров в каталоге"],
                ["1–3", "дня доставка"],
                ["10", "дней максимум от обжарки"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-bold text-ink">{value}</dt>
                  <dd className="mt-1 max-w-[8rem] text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { art: "bag", color: "#b4532a", name: "Пачка кофе", shift: true, tilt: "-3deg" },
              { art: "kettle", color: "#4a5560", name: "Чайник", shift: false, tilt: "2deg" },
              { art: "cup", color: "#c9692f", name: "Чашка", shift: true, tilt: "2deg" },
              { art: "tin", color: "#3f5b45", name: "Банка чая", shift: false, tilt: "-2deg" },
            ].map((item, i) => (
              <div
                key={item.name}
                className={`fade-up ${item.shift ? "translate-y-6" : ""}`}
                style={{ "--d": `${200 + i * 120}ms` } as React.CSSProperties}
              >
                <div
                  className="float"
                  style={{ "--d": `${i * -1.6}s`, "--tilt": item.tilt } as React.CSSProperties}
                >
                  <ProductArt
                    art={item.art}
                    color={item.color}
                    name={item.name}
                    className="shadow-xl shadow-ink/10"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-ink bg-ink py-3.5 text-paper" aria-hidden>
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
                <ProductArt art={look.art} color={look.color} name={category.name} className="w-16 shrink-0 rounded-xl" />
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
