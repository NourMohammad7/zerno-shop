"use server";

import { createClient } from "@/lib/supabase/server";

type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  comment: string;
};

type Result = { number: number } | { error: string };

export async function placeOrder(
  items: { id: number; qty: number }[],
  customer: Customer,
): Promise<Result> {
  const supabase = await createClient();

  // Цены и остатки проверяет функция в базе — из браузера приходят только id и количество.
  const { data, error } = await supabase.rpc("create_order", {
    p_name: String(customer.name ?? ""),
    p_phone: String(customer.phone ?? ""),
    p_email: String(customer.email ?? ""),
    p_address: String(customer.address ?? ""),
    p_comment: String(customer.comment ?? ""),
    p_items: Array.isArray(items)
      ? items.map((i) => ({ id: Number(i.id), qty: Number(i.qty) }))
      : [],
  });

  if (error) {
    // P0001 — наши собственные сообщения из create_order, их можно показать покупателю.
    if (error.code === "P0001") return { error: error.message };
    console.error("create_order failed", error);
    return { error: "Не удалось оформить заказ. Попробуйте ещё раз." };
  }

  return { number: Number(data) };
}
