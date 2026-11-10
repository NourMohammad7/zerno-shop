"use client";

import { statusLabel } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-accent text-paper",
  confirmed: "bg-ink text-paper",
  shipped: "bg-leaf text-paper",
  done: "bg-line text-ink",
  cancelled: "bg-transparent text-muted line-through",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}>
      {statusLabel(status)}
    </span>
  );
}

// Кнопка отправки формы, которая сначала переспрашивает.
export function ConfirmButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={className}
      onClick={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

// Выпадающий список, который отправляет форму сразу при выборе.
export function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  className,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={className}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}
