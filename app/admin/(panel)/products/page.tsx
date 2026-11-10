import type { Metadata } from "next";
import Link from "next/link";
import { ProductArt } from "@/components/ProductArt";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { deleteProduct, toggleProduct } from "../actions";
import { ConfirmButton } from "../ui";

export const metadata: Metadata = { title: "Товары" };

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("products")
    .select("*, categories(slug, name)")
    .order("created_at", { ascending: false })
    .order("id");
  const products = (data ?? []) as Product[];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Товары</h1>
        <Link href="/admin/products/new" className="btn btn-sm">Добавить товар</Link>
      </div>

      <div className="panel mt-6 overflow-x-auto">
        {products.length === 0 ? (
          <p className="p-6 text-sm text-muted">Товаров пока нет.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Товар</th>
                <th className="py-3 font-semibold">Категория</th>
                <th className="py-3 text-right font-semibold">Цена</th>
                <th className="py-3 pr-6 text-right font-semibold">Остаток</th>
                <th className="py-3 font-semibold">На сайте</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {products.map((product) => (
                <tr key={product.id} className={product.is_active ? "" : "opacity-60"}>
                  <td className="px-5 py-3">
                    <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 hover:text-accent">
                      <ProductArt
                        art={product.art}
                        color={product.color}
                        imageUrl={product.image_url}
                        name={product.name}
                        className="w-11 shrink-0 rounded-lg"
                      />
                      <span className="font-semibold">
                        {product.name}
                        {product.is_featured && <span className="ml-2 text-xs text-accent">★</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted">{product.categories?.name ?? "—"}</td>
                  <td className="py-3 text-right whitespace-nowrap tabular-nums">{formatPrice(product.price)}</td>
                  <td className={`py-3 pr-6 text-right tabular-nums ${product.stock <= 5 ? "font-bold text-accent" : ""}`}>
                    {product.stock}
                  </td>
                  <td className="py-3">
                    <form action={toggleProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <input type="hidden" name="active" value={String(!product.is_active)} />
                      <button className="cursor-pointer text-xs font-semibold underline underline-offset-4 hover:text-accent">
                        {product.is_active ? "Показан" : "Скрыт"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <ConfirmButton
                        message={`Удалить товар «${product.name}»?`}
                        className="cursor-pointer text-xs font-semibold text-muted hover:text-accent"
                      >
                        Удалить
                      </ConfirmButton>
                    </form>
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
