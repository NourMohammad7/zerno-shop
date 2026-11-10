import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order, Product } from "@/lib/types";
import { StatusBadge } from "./ui";

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const [{ data: orderRows }, { count: productCount }, { data: lowStock }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id, name, stock")
      .eq("is_active", true)
      .lte("stock", 5)
      .order("stock")
      .limit(6),
  ]);

  const orders = (orderRows ?? []) as Order[];
  const valid = orders.filter((o) => o.status !== "cancelled");
  const revenue = valid.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Выручка", value: formatPrice(revenue) },
    { label: "Заказов", value: String(valid.length) },
    { label: "Новых заказов", value: String(orders.filter((o) => o.status === "new").length) },
    { label: "Средний чек", value: valid.length ? formatPrice(Math.round(revenue / valid.length)) : "—" },
    { label: "Товаров", value: String(productCount ?? 0) },
  ];

  return (
    <>
      <h1 className="font-display text-3xl font-bold">Обзор</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="panel p-4">
            <div className="text-xs font-semibold tracking-wide text-muted uppercase">{stat.label}</div>
            <div className="mt-2 text-2xl font-bold tabular-nums">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <h2 className="font-display text-xl font-semibold">Последние заказы</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-accent">Все заказы</Link>
          </div>
          {orders.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-muted">Заказов пока нет.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line border-t border-line">
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.number}`} className="font-bold hover:text-accent">
                        № {order.number}
                      </Link>
                    </td>
                    <td className="py-3">{order.customer_name}</td>
                    <td className="hidden py-3 text-muted sm:table-cell">{formatDate(order.created_at)}</td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel h-fit p-5">
          <h2 className="font-display text-xl font-semibold">Заканчиваются</h2>
          {(lowStock ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted">Всех товаров достаточно.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {(lowStock as Pick<Product, "id" | "name" | "stock">[]).map((product) => (
                <li key={product.id} className="flex justify-between gap-3 py-2.5">
                  <Link href={`/admin/products/${product.id}`} className="hover:text-accent">{product.name}</Link>
                  <span className={`font-bold tabular-nums ${product.stock === 0 ? "text-accent" : ""}`}>
                    {product.stock} шт.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
