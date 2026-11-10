"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";

export function CartLink() {
  const count = cartCount(useCart());

  return (
    <Link
      href="/cart"
      className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent"
    >
      Корзина
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-paper px-1 text-xs text-ink tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
