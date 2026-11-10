"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { ART_KINDS, ORDER_STATUSES } from "@/lib/types";

// Права проверяются дважды: здесь и политиками RLS в базе.

export async function signOut() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveProduct(_prev: string | null, form: FormData): Promise<string | null> {
  const { supabase } = await requireAdmin();

  const id = Number(form.get("id")) || null;
  const name = String(form.get("name") ?? "").trim();
  if (!name) return "Укажите название";

  const slug = slugify(String(form.get("slug") ?? "").trim() || name);
  if (!slug) return "Укажите адрес товара латиницей";

  const price = Number(form.get("price"));
  if (!Number.isInteger(price) || price < 0) return "Цена — целое число рублей";

  const oldRaw = String(form.get("old_price") ?? "").trim();
  const oldPrice = oldRaw ? Number(oldRaw) : null;
  if (oldPrice !== null && (!Number.isInteger(oldPrice) || oldPrice < 0)) {
    return "Старая цена — целое число рублей";
  }

  const stock = Number(form.get("stock"));
  if (!Number.isInteger(stock) || stock < 0) return "Остаток — целое неотрицательное число";

  const imageUrl = String(form.get("image_url") ?? "").trim();
  if (imageUrl && !imageUrl.startsWith("https://")) return "Ссылка на фото должна начинаться с https://";

  const color = String(form.get("color") ?? "");
  const art = String(form.get("art") ?? "");

  const row = {
    name,
    slug,
    subtitle: String(form.get("subtitle") ?? "").trim(),
    description: String(form.get("description") ?? "").trim(),
    price,
    old_price: oldPrice,
    stock,
    category_id: Number(form.get("category_id")) || null,
    is_active: form.get("is_active") === "on",
    is_featured: form.get("is_featured") === "on",
    art: ART_KINDS.some((k) => k.value === art) ? art : "bag",
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : "#b4532a",
    image_url: imageUrl || null,
  };

  const { error } = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);

  if (error) {
    if (error.code === "23505") return "Товар с таким адресом уже есть — измените адрес";
    console.error("saveProduct failed", error);
    return "Не удалось сохранить товар";
  }

  redirect("/admin/products");
}

export async function toggleProduct(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("products")
    .update({ is_active: form.get("active") === "true" })
    .eq("id", Number(form.get("id")));
  revalidatePath("/admin/products");
}

export async function deleteProduct(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("products").delete().eq("id", Number(form.get("id")));
  revalidatePath("/admin/products");
}

export async function setOrderStatus(form: FormData) {
  const { supabase } = await requireAdmin();
  const status = String(form.get("status"));
  if (!ORDER_STATUSES.some((s) => s.value === status)) return;
  await supabase.from("orders").update({ status }).eq("id", String(form.get("id")));
  revalidatePath("/admin", "layout");
}

export async function addCategory(_prev: string | null, form: FormData): Promise<string | null> {
  const { supabase } = await requireAdmin();

  const name = String(form.get("name") ?? "").trim();
  if (!name) return "Укажите название";
  const slug = slugify(String(form.get("slug") ?? "").trim() || name);
  if (!slug) return "Укажите адрес латиницей";

  const { error } = await supabase
    .from("categories")
    .insert({ name, slug, sort: Number(form.get("sort")) || 0 });

  if (error) {
    return error.code === "23505" ? "Категория с таким адресом уже есть" : "Не удалось добавить категорию";
  }
  revalidatePath("/admin/categories");
  return null;
}

export async function deleteCategory(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").delete().eq("id", Number(form.get("id")));
  revalidatePath("/admin/categories");
}
