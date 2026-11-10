import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";

export const metadata: Metadata = { title: "Каталог" };

const SORTS = [
  { value: "new", label: "Сначала новые" },
  { value: "cheap", label: "Сначала дешевле" },
  { value: "expensive", label: "Сначала дороже" },
];

type Search = { category?: string; q?: string; sort?: string };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { category: categorySlug, q = "", sort = "new" } = await searchParams;
  const supabase = await createClient();

  const { data: categoryRows } = await supabase.from("categories").select("*").order("sort");
  const categories = (categoryRows ?? []) as Category[];
  const current = categories.find((c) => c.slug === categorySlug);

  let query = supabase.from("products").select("*").eq("is_active", true);
  if (current) query = query.eq("category_id", current.id);
  if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);
  if (sort === "cheap") query = query.order("price");
  else if (sort === "expensive") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false }).order("id");

  const { data: productRows } = await query;
  const products = (productRows ?? []) as Product[];

  const link = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (q.trim()) params.set("q", q.trim());
    if (sort !== "new") params.set("sort", sort);
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">
        {current ? current.name : "Каталог"}
      </h1>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={link()} className={chip(!current)}>Все товары</Link>
        {categories.map((category) => (
          <Link key={category.id} href={link(category.slug)} className={chip(current?.id === category.id)}>
            {category.name}
          </Link>
        ))}
      </div>

      <form action="/catalog" className="mt-5 flex flex-wrap gap-3">
        {current && <input type="hidden" name="category" value={current.slug} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Поиск по названию"
          className="input max-w-xs"
        />
        <select name="sort" defaultValue={sort} className="input w-auto">
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button className="btn-outline">Показать</button>
      </form>

      {products.length === 0 ? (
        <div className="panel mt-10 p-10 text-center">
          <p className="font-display text-2xl font-semibold">Ничего не нашлось</p>
          <p className="mt-2 text-sm text-muted">Попробуйте другой запрос или категорию.</p>
          <Link href="/catalog" className="btn mt-6">Сбросить фильтры</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
