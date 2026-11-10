"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  art: string;
  color: string;
  image_url: string | null;
  qty: number;
};

const KEY = "zerno-cart";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();

let cache: CartItem[] = EMPTY;
let loaded = false;

function read() {
  if (!loaded) {
    loaded = true;
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      cache = Array.isArray(parsed) ? parsed : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function write(next: CartItem[]) {
  cache = next;
  loaded = true;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Корзина меняется и в других вкладках.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      loaded = false;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cart = {
  add(item: Omit<CartItem, "qty">, qty = 1) {
    const items = read();
    const existing = items.find((i) => i.id === item.id);
    write(
      existing
        ? items.map((i) => (i.id === item.id ? { ...i, ...item, qty: Math.min(i.qty + qty, 99) } : i))
        : [...items, { ...item, qty }],
    );
  },
  setQty(id: number, qty: number) {
    if (qty < 1) return cart.remove(id);
    write(read().map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 99) } : i)));
  },
  remove(id: number) {
    write(read().filter((i) => i.id !== id));
  },
  clear() {
    write([]);
  },
};

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
