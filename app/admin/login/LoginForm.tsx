"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function LoginForm({ notice }: { notice: string | null }) {
  const [error, action, pending] = useActionState(signIn, null);
  const message = error ?? notice;

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label className="label" htmlFor="email">Почта</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Пароль</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      {message && (
        <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent-dark">
          {message}
        </p>
      )}
      <button className="btn w-full" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
