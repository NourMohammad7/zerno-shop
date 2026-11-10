import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Заказ принят" };

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;

  return (
    <div className="mx-auto max-w-xl px-5 pt-24 text-center">
      <p className="text-xs font-bold tracking-[0.2em] text-leaf uppercase">Заказ принят</p>
      <h1 className="mt-4 font-display text-5xl font-bold">Спасибо!</h1>
      <p className="mt-5 text-lg text-muted">
        Номер вашего заказа —{" "}
        <span className="font-bold text-ink tabular-nums">№ {number.replace(/\D/g, "")}</span>. Мы
        позвоним в ближайшее время, чтобы подтвердить его и договориться о доставке.
      </p>
      <Link href="/catalog" className="btn mt-9">Вернуться в каталог</Link>
    </div>
  );
}
