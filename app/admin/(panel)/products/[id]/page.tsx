import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { Category, Product } from "@/lib/types";
import { ProductForm } from "../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", Number(id)).maybeSingle(),
    supabase.from("categories").select("*").order("sort"),
  ]);
  if (!product) notFound();

  return (
    <>
      <h1 className="font-display text-3xl font-bold">{(product as Product).name}</h1>
      <ProductForm product={product as Product} categories={(categories ?? []) as Category[]} />
    </>
  );
}
