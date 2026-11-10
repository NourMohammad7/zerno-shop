import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUSES, type Order, type OrderItem } from "@/lib/types";
import { setOrderStatus } from "../../actions";
import { AutoSubmitSelect, StatusBadge } from "../../ui";

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  if (!/^\d+$/.test(number)) notFound();

  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("number", Number(number))
    .maybeSingle();
  if (!data) notFound();

  const order = data as Order & { order_items: OrderItem[] };

  return (
    <>
      <Link href="/admin/orders" className="text-sm font-semibold text-muted hover:text-ink">
        ← Все заказы
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-3xl font-bold">Заказ № {order.number}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted">{formatDate(order.created_at)}</p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Товар</th>
                <th className="py-3 text-right font-semibold">Цена</th>
                <th className="py-3 text-right font-semibold">Кол-во</th>
                <th className="px-5 py-3 text-right font-semibold">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {order.order_items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">{item.name}</td>
                  <td className="py-3 text-right tabular-nums">{formatPrice(item.price)}</td>
                  <td className="py-3 text-right tabular-nums">{item.qty}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">
                    {formatPrice(item.price * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-line">
              <tr>
                <td colSpan={3} className="px-5 py-4 text-right text-muted">Итого</td>
                <td className="px-5 py-4 text-right text-lg font-bold tabular-nums">{formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="label">Статус</h2>
            <form action={setOrderStatus}>
              <input type="hidden" name="id" value={order.id} />
              <AutoSubmitSelect
                name="status"
                defaultValue={order.status}
                options={ORDER_STATUSES}
                className="input"
              />
            </form>
            <p className="mt-2 text-xs text-muted">
              При отмене товары возвращаются на склад.
            </p>
          </section>

          <section className="panel space-y-4 p-5 text-sm">
            <div>
              <div className="label">Покупатель</div>
              {order.customer_name}
            </div>
            <div>
              <div className="label">Телефон</div>
              <a href={`tel:${order.phone}`} className="font-semibold hover:text-accent">{order.phone}</a>
            </div>
            {order.email && (
              <div>
                <div className="label">Почта</div>
                <a href={`mailto:${order.email}`} className="font-semibold hover:text-accent">{order.email}</a>
              </div>
            )}
            <div>
              <div className="label">Адрес</div>
              {order.address}
            </div>
            {order.comment && (
              <div>
                <div className="label">Комментарий</div>
                <p className="whitespace-pre-line">{order.comment}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
