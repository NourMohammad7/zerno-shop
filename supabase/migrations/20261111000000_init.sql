-- Магазин «Зерно»: схема, права доступа, оформление заказа, начальные данные.

-- Админ — пользователь, у которого в app_metadata стоит role = admin.
-- app_metadata может менять только сервисный ключ, сам пользователь — нет.
create or replace function public.is_admin() returns boolean
language sql stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create table public.categories (
  id bigint generated always as identity primary key,
  slug text unique not null check (char_length(slug) between 1 and 80),
  name text not null check (char_length(name) between 1 and 80),
  sort int not null default 0
);

create table public.products (
  id bigint generated always as identity primary key,
  slug text unique not null check (char_length(slug) between 1 and 120),
  name text not null check (char_length(name) between 1 and 120),
  subtitle text not null default '' check (char_length(subtitle) <= 200),
  description text not null default '' check (char_length(description) <= 5000),
  price int not null check (price >= 0),
  old_price int check (old_price is null or old_price >= 0),
  category_id bigint references public.categories (id) on delete set null,
  stock int not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  art text not null default 'bag',
  color text not null default '#b4532a',
  image_url text,
  created_at timestamptz not null default now()
);

create type public.order_status as enum ('new', 'confirmed', 'shipped', 'done', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001) unique,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  phone text not null check (char_length(phone) between 3 and 40),
  email text check (email is null or char_length(email) <= 200),
  address text not null check (char_length(address) between 1 and 500),
  comment text check (comment is null or char_length(comment) <= 1000),
  total int not null default 0,
  status public.order_status not null default 'new',
  created_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id bigint references public.products (id) on delete set null,
  name text not null,
  price int not null,
  qty int not null check (qty > 0)
);

create index on public.products (category_id);
create index on public.orders (created_at desc);
create index on public.order_items (order_id);

-- Права доступа ---------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant select on public.categories, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;
grant select, update, delete on public.orders, public.order_items to authenticated;

create policy "categories: read" on public.categories for select using (true);
create policy "categories: admin write" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "products: read active" on public.products for select
  using (is_active or public.is_admin());
create policy "products: admin write" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Заказы видит и меняет только админ. Покупатель создаёт заказ через create_order.
create policy "orders: admin" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "order_items: admin" on public.order_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Оформление заказа ------------------------------------------------------
-- Цены и остатки берутся из базы, а не из браузера: подменить цену нельзя.

create or replace function public.create_order(
  p_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_comment text,
  p_items jsonb
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_number bigint;
  v_total int := 0;
  v_item record;
  v_product public.products%rowtype;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception 'Укажите имя, телефон и адрес доставки';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Корзина пуста';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Слишком много позиций в заказе';
  end if;

  insert into public.orders (customer_name, phone, email, address, comment)
  values (trim(p_name), trim(p_phone), nullif(trim(p_email), ''), trim(p_address), nullif(trim(p_comment), ''))
  returning id, number into v_order_id, v_number;

  for v_item in
    select (e ->> 'id')::bigint as id, sum((e ->> 'qty')::int)::int as qty
    from jsonb_array_elements(p_items) e
    group by 1
    order by 1
  loop
    if v_item.id is null or v_item.qty is null or v_item.qty < 1 or v_item.qty > 99 then
      raise exception 'Некорректное количество товара';
    end if;

    select * into v_product from public.products
    where id = v_item.id and is_active
    for update;

    if not found then
      raise exception 'Один из товаров больше не продаётся. Обновите корзину';
    end if;
    if v_product.stock < v_item.qty then
      raise exception 'Товара «%» осталось только % шт.', v_product.name, v_product.stock;
    end if;

    update public.products set stock = stock - v_item.qty where id = v_product.id;

    insert into public.order_items (order_id, product_id, name, price, qty)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_item.qty);

    v_total := v_total + v_product.price * v_item.qty;
  end loop;

  update public.orders set total = v_total where id = v_order_id;
  return v_number;
end;
$$;

revoke all on function public.create_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, text, jsonb) to anon, authenticated;

-- Отмена заказа возвращает товар на склад, снятие отмены — снова списывает.
create or replace function public.orders_restock() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p set stock = p.stock + i.qty
    from public.order_items i
    where i.order_id = new.id and i.product_id = p.id;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    update public.products p set stock = greatest(p.stock - i.qty, 0)
    from public.order_items i
    where i.order_id = new.id and i.product_id = p.id;
  end if;
  return new;
end;
$$;

create trigger orders_restock after update of status on public.orders
for each row execute function public.orders_restock();

-- Фото товаров -----------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "product images: admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());
create policy "product images: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'products' and public.is_admin());
create policy "product images: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- Начальные данные ---------------------------------------------------------

insert into public.categories (slug, name, sort) values
  ('coffee', 'Кофе в зёрнах', 1),
  ('tea', 'Чай', 2),
  ('brewing', 'Заваривание', 3),
  ('cups', 'Посуда', 4);

insert into public.products (slug, name, subtitle, description, price, old_price, category_id, stock, is_featured, art, color)
select v.slug, v.name, v.subtitle, v.description, v.price, v.old_price, c.id, v.stock, v.is_featured, v.art, v.color
from (values
  ('ethiopia-yirgacheffe', 'Эфиопия Иргачеффе', 'Жасмин, бергамот, персик · 250 г',
   'Мытая арабика с высот 1900–2200 м. Светлая обжарка под фильтр раскрывает цветочный аромат и чайное тело. Обжариваем каждую неделю.',
   890, null::int, 'coffee', 40, true, 'bag', '#c9692f'),
  ('colombia-huila', 'Колумбия Уила', 'Карамель, красное яблоко, какао · 250 г',
   'Сбалансированный кофе на каждый день: сладкий, с мягкой кислотностью. Хорош и в эспрессо, и в воронке.',
   790, 950, 'coffee', 55, true, 'bag', '#8f3f1e'),
  ('brazil-cerrado', 'Бразилия Серрадо', 'Орех, молочный шоколад · 1 кг',
   'Натуральная обработка, средняя обжарка. Плотное тело и низкая кислотность — классика для эспрессо и капучино.',
   2390, null, 'coffee', 25, false, 'bag', '#5b4034'),
  ('kenya-aa', 'Кения АА', 'Чёрная смородина, грейпфрут · 250 г',
   'Яркий и сочный лот с выраженной ягодной кислотностью. Для тех, кто любит кофе с характером.',
   1090, null, 'coffee', 18, true, 'bag', '#9c2f3f'),
  ('decaf-mexico', 'Декаф Мексика', 'Тёмный шоколад, тростниковый сахар · 250 г',
   'Кофе без кофеина, декофеинизация горной водой. Вечерняя чашка без компромиссов по вкусу.',
   850, null, 'coffee', 30, false, 'bag', '#3f5b45'),
  ('milk-oolong', 'Молочный улун', 'Сливочный, цветочный · 100 г',
   'Тайваньский улун слабой ферментации. Заваривать водой 85–90 °C, выдерживает до шести проливов.',
   690, null, 'tea', 35, true, 'tin', '#3f5b45'),
  ('assam-breakfast', 'Ассам к завтраку', 'Солод, мёд · 100 г',
   'Крепкий индийский чёрный чай. Хорош с молоком и без, бодрит не хуже кофе.',
   540, null, 'tea', 45, false, 'tin', '#8f3f1e'),
  ('sencha', 'Сенча', 'Свежая зелень, морская нотка · 80 г',
   'Японский зелёный чай весеннего сбора. Заваривать 70 °C не дольше минуты.',
   780, 890, 'tea', 20, false, 'tin', '#6a8f4e'),
  ('v60-dripper', 'Воронка V60', 'Керамика, размер 02',
   'Классическая воронка для пуровера на 1–4 чашки. Керамика держит температуру и не даёт привкусов.',
   2490, null, 'brewing', 15, true, 'dripper', '#b4532a'),
  ('gooseneck-kettle', 'Чайник с гусиным носиком', 'Сталь, 600 мл',
   'Тонкий носик даёт ровную струю и полный контроль над проливом. Подходит для всех типов плит.',
   4290, 4900, 'brewing', 8, false, 'kettle', '#4a5560'),
  ('hand-grinder', 'Ручная кофемолка', 'Стальные жернова, 30 г',
   'Конические жернова из нержавеющей стали, 24 ступени помола — от турки до френч-пресса.',
   5990, null, 'brewing', 6, true, 'grinder', '#5b4034'),
  ('paper-filters', 'Бумажные фильтры', '100 шт., размер 02',
   'Отбелённые кислородом фильтры для воронки. Не дают бумажного привкуса.',
   490, null, 'brewing', 80, false, 'dripper', '#c8b89e'),
  ('ceramic-cup', 'Керамическая чашка', 'Ручная работа, 250 мл',
   'Чашка из каменной массы с матовой глазурью. Каждая немного отличается от другой.',
   1290, null, 'cups', 22, true, 'cup', '#b4532a'),
  ('double-wall-glass', 'Стакан с двойными стенками', 'Боросиликатное стекло, 300 мл',
   'Держит тепло и не обжигает пальцы. Можно мыть в посудомоечной машине.',
   990, null, 'cups', 28, false, 'cup', '#5f8a8b')
) as v (slug, name, subtitle, description, price, old_price, category, stock, is_featured, art, color)
join public.categories c on c.slug = v.category;
