"use client";

import Link from "next/link";
import { ProductArt } from "@/components/ProductArt";
import { cart, cartTotal, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const items = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-24 text-center">
        <h1 className="font-display text-4xl font-bold">Корзина пуста</h1>
        <p className="mt-3 text-muted">Загляните в каталог — там есть из чего выбрать.</p>
        <Link href="/catalog" className="btn mt-8">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pt-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">Корзина</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <Link href={`/product/${item.slug}`} className="w-24 shrink-0">
                <ProductArt art={item.art} color={item.color} imageUrl={item.image_url} name={item.name} />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link href={`/product/${item.slug}`} className="font-display text-lg font-semibold hover:text-accent">
                    {item.name}
                  </Link>
                  <span className="font-bold whitespace-nowrap tabular-nums">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
                <span className="text-sm text-muted tabular-nums">{formatPrice(item.price)} за штуку</span>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-ink/25">
                    <button
                      aria-label="Меньше"
                      className="h-9 w-9 cursor-pointer"
                      onClick={() => cart.setQty(item.id, item.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                    <button
                      aria-label="Больше"
                      className="h-9 w-9 cursor-pointer"
                      onClick={() => cart.setQty(item.id, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cursor-pointer text-sm text-muted underline underline-offset-4 hover:text-accent"
                    onClick={() => cart.remove(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="panel h-fit p-6">
          <div className="flex items-baseline justify-between">
            <span className="text-muted">Итого</span>
            <span className="text-2xl font-bold tabular-nums">{formatPrice(cartTotal(items))}</span>
          </div>
          <p className="mt-2 text-sm text-muted">Доставку рассчитаем при подтверждении заказа.</p>
          <Link href="/checkout" className="btn mt-6 w-full">Оформить заказ</Link>
          <Link href="/catalog" className="mt-4 block text-center text-sm font-semibold text-muted hover:text-ink">
            Продолжить покупки
          </Link>
        </aside>
      </div>
    </div>
  );
}
