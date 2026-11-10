import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUSES, type Order } from "@/lib/types";
import { StatusBadge } from "../ui";

export const metadata: Metadata = { title: "Заказы" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();
  const filter = ORDER_STATUSES.find((s) => s.value === status);

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (filter) query = query.eq("status", filter.value);
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
      active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
    }`;

  return (
    <>
      <h1 className="font-display text-3xl font-bold">Заказы</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={chip(!filter)}>Все</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s.value} href={`/admin/orders?status=${s.value}`} className={chip(filter?.value === s.value)}>
            {s.label}
          </Link>
        ))}
      </div>

      <div className="panel mt-6 overflow-x-auto">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-muted">Заказов нет.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Заказ</th>
                <th className="py-3 font-semibold">Покупатель</th>
                <th className="py-3 font-semibold">Телефон</th>
                <th className="py-3 font-semibold">Дата</th>
                <th className="py-3 font-semibold">Статус</th>
                <th className="px-5 py-3 text-right font-semibold">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.number}`} className="font-bold hover:text-accent">
                      № {order.number}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{order.customer_name}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{order.phone}</td>
                  <td className="py-3 pr-4 whitespace-nowrap text-muted">{formatDate(order.created_at)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
