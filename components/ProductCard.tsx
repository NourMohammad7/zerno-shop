import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCart } from "./AddToCart";
import { ProductArt } from "./ProductArt";

export function ProductCard({ product }: { product: Product }) {
  const href = `/product/${product.slug}`;
  const onSale = product.old_price && product.old_price > product.price;

  return (
    <article className="reveal group flex flex-col">
      <Link href={href} className="relative block">
        <ProductArt
          art={product.art}
          color={product.color}
          imageUrl={product.image_url}
          name={product.name}
          className="transition duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-ink/15"
        />
        {onSale && (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-paper shadow-md">
            −{Math.round((1 - product.price / product.old_price!) * 100)}%
          </span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-3 right-3 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-bold text-ink backdrop-blur">
            Осталось {product.stock}
          </span>
        )}
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <Link
          href={href}
          className="font-display text-lg leading-snug font-semibold transition-colors hover:text-accent"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-sm text-muted">{product.subtitle}</p>
        <div className="mt-auto flex flex-col items-start gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-base font-bold tabular-nums">{formatPrice(product.price)}</span>
            {onSale && (
              <span className="text-sm text-muted line-through tabular-nums">
                {formatPrice(product.old_price!)}
              </span>
            )}
          </div>
          <AddToCart
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
        </div>
      </div>
    </article>
  );
}
