"use client";

import { useActionState } from "react";
import { addCategory } from "../actions";

export function CategoryForm() {
  const [error, action, pending] = useActionState(addCategory, null);

  return (
    <form action={action} className="panel h-fit space-y-4 p-6">
      <h2 className="font-display text-xl font-semibold">Новая категория</h2>
      <div>
        <label className="label" htmlFor="name">Название</label>
        <input id="name" name="name" required maxLength={80} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="slug">Адрес</label>
        <input id="slug" name="slug" maxLength={80} placeholder="Заполнится из названия" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="sort">Порядок</label>
        <input id="sort" name="sort" type="number" defaultValue={10} className="input" />
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-accent-dark">{error}</p>
      )}
      <button className="btn w-full" disabled={pending}>
        {pending ? "Добавляем…" : "Добавить"}
      </button>
    </form>
  );
}
