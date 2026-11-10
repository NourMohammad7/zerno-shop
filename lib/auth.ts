import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

// Возвращает клиент Supabase с сессией админа либо отправляет на страницу входа.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  if (user.app_metadata?.role !== "admin") redirect("/admin/login?error=forbidden");

  return { supabase, user };
}
