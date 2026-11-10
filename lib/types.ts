export type Category = {
  id: number;
  slug: string;
  name: string;
  sort: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  old_price: number | null;
  category_id: number | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  art: string;
  color: string;
  image_url: string | null;
  created_at: string;
  categories?: { slug: string; name: string } | null;
};

export type OrderStatus = "new" | "confirmed" | "shipped" | "done" | "cancelled";

export type Order = {
  id: string;
  number: number;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  comment: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: string;
  product_id: number | null;
  name: string;
  price: number;
  qty: number;
};

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "Новый" },
  { value: "confirmed", label: "Подтверждён" },
  { value: "shipped", label: "Отправлен" },
  { value: "done", label: "Выполнен" },
  { value: "cancelled", label: "Отменён" },
];

export const ART_KINDS: { value: string; label: string }[] = [
  { value: "bag", label: "Пачка кофе" },
  { value: "tin", label: "Банка чая" },
  { value: "dripper", label: "Воронка" },
  { value: "kettle", label: "Чайник" },
  { value: "grinder", label: "Кофемолка" },
  { value: "cup", label: "Чашка" },
];
