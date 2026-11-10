"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ProductArt } from "@/components/ProductArt";
import { createClient } from "@/lib/supabase/client";
import { ART_KINDS, type Category, type Product } from "@/lib/types";
import { saveProduct } from "../actions";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [error, action, pending] = useActionState(saveProduct, null);
  const [name, setName] = useState(product?.name ?? "");
  const [art, setArt] = useState(product?.art ?? "bag");
  const [color, setColor] = useState(product?.color ?? "#b4532a");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Фото грузится из браузера прямо в хранилище Supabase; в форму попадает только ссылка.
  async function upload(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Файл больше 5 МБ");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: failure } = await supabase.storage.from("products").upload(path, file);
    setUploading(false);
    if (failure) {
      setUploadError("Не удалось загрузить фото. Подойдут JPG, PNG, WebP или AVIF до 5 МБ.");
      return;
    }
    setImageUrl(supabase.storage.from("products").getPublicUrl(path).data.publicUrl);
  }

  return (
    <form action={action} className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />

      <div className="panel grid gap-5 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">Название</label>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="subtitle">Короткое описание</label>
          <input
            id="subtitle"
            name="subtitle"
            maxLength={200}
            defaultValue={product?.subtitle}
            placeholder="Карамель, красное яблоко · 250 г"
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={5000}
            defaultValue={product?.description}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="price">Цена, ₽</label>
          <input id="price" name="price" type="number" min={0} step={1} required defaultValue={product?.price} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="old_price">Старая цена, ₽</label>
          <input
            id="old_price"
            name="old_price"
            type="number"
            min={0}
            step={1}
            defaultValue={product?.old_price ?? ""}
            placeholder="Если есть скидка"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="stock">Остаток, шт.</label>
          <input id="stock" name="stock" type="number" min={0} step={1} required defaultValue={product?.stock ?? 0} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="category_id">Категория</label>
          <select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""} className="input">
            <option value="">Без категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="slug">Адрес страницы</label>
          <input
            id="slug"
            name="slug"
            maxLength={100}
            defaultValue={product?.slug}
            placeholder="Заполнится из названия"
            className="input"
          />
        </div>
        <div className="flex flex-wrap gap-6 text-sm font-semibold sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="h-4 w-4 accent-ink" />
            Показывать на сайте
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} className="h-4 w-4 accent-ink" />
            В «Выборе недели» на главной
          </label>
        </div>
      </div>

      <div className="space-y-6">
        <div className="panel space-y-4 p-6">
          <ProductArt art={art} color={color} imageUrl={imageUrl || null} name={name || "Товар"} />

          <div>
            <label className="label" htmlFor="image">Фото</label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={uploading}
              onChange={(event) => upload(event.target.files?.[0])}
              className="block w-full text-xs file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-paper"
            />
            {uploading && <p className="mt-2 text-xs text-muted">Загружаем…</p>}
            {uploadError && <p role="alert" className="mt-2 text-xs font-semibold text-accent-dark">{uploadError}</p>}
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="mt-2 cursor-pointer text-xs font-semibold text-muted underline underline-offset-4 hover:text-accent"
              >
                Убрать фото
              </button>
            )}
          </div>

          <p className="text-xs text-muted">Без фото на сайте показывается иллюстрация:</p>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <select
              name="art"
              aria-label="Иллюстрация"
              value={art}
              onChange={(event) => setArt(event.target.value)}
              className="input"
            >
              {ART_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>{kind.label}</option>
              ))}
            </select>
            <input
              type="color"
              name="color"
              aria-label="Цвет"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-[42px] w-14 cursor-pointer rounded-xl border border-line bg-white p-1"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent-dark">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button className="btn flex-1" disabled={pending || uploading}>
            {pending ? "Сохраняем…" : "Сохранить"}
          </button>
          <Link href="/admin/products" className="btn-outline">Отмена</Link>
        </div>
      </div>
    </form>
  );
}
