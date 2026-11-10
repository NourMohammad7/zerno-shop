import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/types";
import { deleteCategory } from "../actions";
import { ConfirmButton } from "../ui";
import { CategoryForm } from "./CategoryForm";

export const metadata: Metadata = { title: "Категории" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*, products(count)").order("sort");
  const categories = (data ?? []) as (Category & { products: { count: number }[] })[];

  return (
    <>
      <h1 className="font-display text-3xl font-bold">Категории</h1>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="panel h-fit overflow-x-auto">
          {categories.length === 0 ? (
            <p className="p-6 text-sm text-muted">Категорий пока нет.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Название</th>
                  <th className="py-3 font-semibold">Адрес</th>
                  <th className="py-3 text-right font-semibold">Товаров</th>
                  <th className="py-3 text-right font-semibold">Порядок</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-5 py-3 font-semibold">{category.name}</td>
                    <td className="py-3 text-muted">{category.slug}</td>
                    <td className="py-3 text-right tabular-nums">{category.products[0]?.count ?? 0}</td>
                    <td className="py-3 text-right tabular-nums">{category.sort}</td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={category.id} />
                        <ConfirmButton
                          message={`Удалить категорию «${category.name}»? Товары останутся, но без категории.`}
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
        <CategoryForm />
      </div>
    </>
  );
}
