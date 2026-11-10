"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cart, cartTotal, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  const items = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (items.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-24 text-center">
        <h1 className="font-display text-4xl font-bold">Нечего оформлять</h1>
        <p className="mt-3 text-muted">Сначала добавьте товары в корзину.</p>
        <Link href="/catalog" className="btn mt-8">Перейти в каталог</Link>
      </div>
    );
  }

  function submit(form: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await placeOrder(
        items.map((i) => ({ id: i.id, qty: i.qty })),
        {
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          email: String(form.get("email") ?? ""),
          address: String(form.get("address") ?? ""),
          comment: String(form.get("comment") ?? ""),
        },
      );
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setDone(true);
      cart.clear();
      router.push(`/order/${result.number}`);
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pt-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">Оформление заказа</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <form action={submit} className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Имя</label>
            <input id="name" name="name" required maxLength={120} autoComplete="name" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Телефон</label>
            <input id="phone" name="phone" type="tel" required minLength={3} maxLength={40} autoComplete="tel" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="email">Почта (необязательно)</label>
            <input id="email" name="email" type="email" maxLength={200} autoComplete="email" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="address">Адрес доставки</label>
            <input id="address" name="address" required maxLength={500} autoComplete="street-address" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="comment">Комментарий (необязательно)</label>
            <textarea id="comment" name="comment" rows={3} maxLength={1000} className="input" />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent-dark sm:col-span-2">
              {error}
            </p>
          )}

          <div className="sm:col-span-2">
            <button className="btn" disabled={pending}>
              {pending ? "Оформляем…" : "Подтвердить заказ"}
            </button>
            <p className="mt-3 text-sm text-muted">
              Оплата при получении. Мы позвоним, чтобы подтвердить заказ и время доставки.
            </p>
          </div>
        </form>

        <aside className="panel h-fit p-6">
          <h2 className="font-display text-xl font-semibold">Ваш заказ</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.name} <span className="text-muted">× {item.qty}</span>
                </span>
                <span className="font-semibold whitespace-nowrap tabular-nums">
                  {formatPrice(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-muted">Итого</span>
            <span className="text-2xl font-bold tabular-nums">{formatPrice(cartTotal(items))}</span>
          </div>
          <Link href="/cart" className="mt-4 block text-sm font-semibold text-muted hover:text-ink">
            Изменить корзину
          </Link>
        </aside>
      </div>
    </div>
  );
}
