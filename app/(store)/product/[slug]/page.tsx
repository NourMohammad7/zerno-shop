import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(slug, name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data as Product | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return product ? { title: product.name, description: product.subtitle } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const { data: related } = product.category_id
    ? await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .limit(4)
    : { data: [] };

  const onSale = product.old_price && product.old_price > product.price;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-8">
      <nav className="text-sm text-muted">
        <Link href="/catalog" className="hover:text-ink">Каталог</Link>
        {product.categories && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/catalog?category=${product.categories.slug}`} className="hover:text-ink">
              {product.categories.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ProductArt
          art={product.art}
          color={product.color}
          imageUrl={product.image_url}
          name={product.name}
          className="rounded-3xl"
        />
        <div className="md:pt-6">
          <h1 className="font-display text-4xl leading-tight font-bold md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-lg text-muted">{product.subtitle}</p>

          <div className="mt-7 flex items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums">{formatPrice(product.price)}</span>
            {onSale && (
              <span className="text-lg text-muted line-through tabular-nums">
                {formatPrice(product.old_price!)}
              </span>
            )}
          </div>

          <p className={`mt-2 text-sm font-semibold ${product.stock > 0 ? "text-leaf" : "text-muted"}`}>
            {product.stock > 5
              ? "В наличии"
              : product.stock > 0
                ? `Осталось ${product.stock} шт.`
                : "Нет в наличии"}
          </p>

          <AddToCart
            withQty
            className="mt-7"
            stock={product.stock}
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              art: product.art,
              color: product.color,
              image_url: product.image_url,
            }}
          />

          {product.description && (
            <p className="mt-9 border-t border-line pt-7 leading-relaxed whitespace-pre-line text-ink/85">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold">Из той же категории</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {(related as Product[]).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
