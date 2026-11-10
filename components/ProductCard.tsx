import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCart } from "./AddToCart";
import { ProductArt } from "./ProductArt";

export function ProductCard({ product }: { product: Product }) {
  const href = `/product/${product.slug}`;

  return (
    <article className="group flex flex-col">
      <Link href={href} className="relative block">
        <ProductArt
          art={product.art}
          color={product.color}
          imageUrl={product.image_url}
          name={product.name}
          className="transition group-hover:-translate-y-1"
        />
        {product.old_price && product.old_price > product.price && (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-paper">
            −{Math.round((1 - product.price / product.old_price) * 100)}%
          </span>
        )}
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <Link href={href} className="font-display text-lg leading-snug font-semibold hover:text-accent">
          {product.name}
        </Link>
        <p className="mt-1 text-sm text-muted">{product.subtitle}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tabular-nums">{formatPrice(product.price)}</span>
            {product.old_price && product.old_price > product.price && (
              <span className="text-sm text-muted line-through tabular-nums">
                {formatPrice(product.old_price)}
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
