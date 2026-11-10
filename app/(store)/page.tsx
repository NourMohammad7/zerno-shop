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
  const [{ data: categories }, { data: featured }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-14 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-20">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
            Кофе · чай · заваривание
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] font-bold tracking-tight md:text-7xl">
            Хорошая чашка начинается с зерна
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Обжариваем небольшими партиями, подбираем чай у проверенных хозяйств и продаём
            только то, чем завариваем сами.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog" className="btn">Смотреть каталог</Link>
            <Link href="/catalog?category=coffee" className="btn-outline">Выбрать кофе</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ProductArt art="bag" color="#b4532a" name="Пачка кофе" className="translate-y-6" />
          <ProductArt art="kettle" color="#4a5560" name="Чайник" />
          <ProductArt art="cup" color="#c9692f" name="Чашка" className="translate-y-6" />
          <ProductArt art="tin" color="#3f5b45" name="Банка чая" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {((categories ?? []) as Category[]).map((category) => {
            const look = CATEGORY_ART[category.slug] ?? { art: "bag", color: "#b4532a" };
            return (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="panel group flex items-center gap-3 p-3 transition hover:border-ink"
              >
                <ProductArt art={look.art} color={look.color} name={category.name} className="w-16 shrink-0 rounded-xl" />
                <span className="font-semibold group-hover:text-accent">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex items-end justify-between gap-4">
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
            <div key={perk.title} className="panel p-6">
              <h3 className="font-display text-xl font-semibold">{perk.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{perk.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
