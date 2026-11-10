import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/types";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Новый товар" };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort");

  return (
    <>
      <h1 className="font-display text-3xl font-bold">Новый товар</h1>
      <ProductForm categories={(data ?? []) as Category[]} />
    </>
  );
}
