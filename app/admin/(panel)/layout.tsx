import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./AdminNav";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: { default: "Админ-панель", template: "%s — Админ-панель" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 bg-ink p-4 text-paper md:w-56 md:gap-8 md:p-5">
        <Link href="/admin" className="font-display text-2xl font-bold">
          Зерно<span className="text-accent">.</span>
        </Link>
        <AdminNav />
        <div className="flex items-center justify-between gap-3 text-xs text-paper/60 md:mt-auto md:flex-col md:items-start">
          <span className="truncate">{user.email}</span>
          <div className="flex gap-4 font-semibold">
            <Link href="/" className="hover:text-paper">На сайт</Link>
            <form action={signOut}>
              <button className="cursor-pointer hover:text-paper">Выйти</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}
