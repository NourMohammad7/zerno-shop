"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prev: string | null, form: FormData): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  });

  if (error) return "Неверная почта или пароль";

  if (data.user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return "У этой учётной записи нет доступа к админ-панели";
  }

  redirect("/admin");
}
