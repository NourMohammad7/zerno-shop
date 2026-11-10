"use client";

import Link from "next/link";
import { useState } from "react";
import { cart, type CartItem } from "@/lib/cart";

type Props = {
  product: Omit<CartItem, "qty">;
  stock: number;
  withQty?: boolean;
  className?: string;
};

export function AddToCart({ product, stock, withQty = false, className = "" }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (stock < 1) {
    return (
      <button className={`btn-outline ${className}`} disabled>
        Нет в наличии
      </button>
    );
  }

  function add() {
    cart.add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {withQty && (
        <div className="flex items-center rounded-full border border-ink/25">
          <button
            type="button"
            aria-label="Меньше"
            className="h-11 w-11 cursor-pointer text-lg"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
          <button
            type="button"
            aria-label="Больше"
            className="h-11 w-11 cursor-pointer text-lg"
            onClick={() => setQty((q) => Math.min(Math.min(stock, 99), q + 1))}
          >
            +
          </button>
        </div>
      )}
      <button type="button" className={withQty ? "btn" : "btn btn-sm"} onClick={add}>
        {added ? "Добавлено ✓" : "В корзину"}
      </button>
      {withQty && added && (
        <Link href="/cart" className="text-sm font-semibold text-accent underline underline-offset-4">
          Перейти в корзину
        </Link>
      )}
    </div>
  );
}
