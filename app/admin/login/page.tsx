import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Вход в админ-панель" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.app_metadata?.role === "admin") redirect("/admin");

  return (
    <main className="grid flex-1 place-items-center px-5 py-16">
      <div className="panel w-full max-w-sm p-8">
        <Link href="/" className="font-display text-2xl font-bold">
          Зерно<span className="text-accent">.</span>
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold">Админ-панель</h1>
        <p className="mt-2 text-sm text-muted">Войдите, чтобы управлять товарами и заказами.</p>
        <LoginForm
          notice={error === "forbidden" ? "У этой учётной записи нет доступа к админ-панели" : null}
        />
      </div>
    </main>
  );
}
