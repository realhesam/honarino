"use client";

import InputRow from "@/ui/InputRow";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { LuSearch, LuChevronLeft } from "react-icons/lu";
import { CategoryService } from "@/lib/modules/category/category.service";
import { CategoryResponse, CategoryWithParentResponse } from "@/lib/modules/category/category.types";

export default function CategoryDetailPage() {
  const params = useParams<{ categorySlug: string }>();
  const slug = params.categorySlug;

  const [query, setQuery] = useState("");

  const [category, setCategory] = useState<CategoryWithParentResponse | null>(null);
  const [children, setChildren] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const base = await CategoryService.get_category_by_slug(slug);
      const full = await CategoryService.get_category(base.id);
      setCategory(full);

      const childrenResponse = await CategoryService.list_child_categories(base.id);
      setChildren(childrenResponse.data ?? []);
    } catch (err) {
      setError("این دسته‌بندی یافت نشد یا در بارگذاری آن خطایی رخ داد.");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  const filteredChildren = children.filter((sub) =>
    query.trim() ? sub.name.toLowerCase().includes(query.trim().toLowerCase()) : true
  );

  if (isLoading) {
    return (
      <div className="container mt-30 text-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center text-neutral-400 animate-pulse">
          در حال بارگذاری دسته‌بندی...
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mt-30 text-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center text-rose-500">
          {error || "دسته‌بندی مورد نظر یافت نشد."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-30 text-neutral-900">
      <div>
        <div className="bg-white rounded-xl border border-stone-200 max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4">
            <Link href="/" className="hover:text-emerald-700 transition-colors">
              خانه
            </Link>
            <LuChevronLeft size={12} />
            <Link
              href="/categories"
              className="hover:text-emerald-700 transition-colors"
            >
              دسته‌بندی‌ها
            </Link>
            {category.parent && (
              <>
                <LuChevronLeft size={12} />
                <Link
                  href={`/categories/${category.parent.slug}`}
                  className="hover:text-emerald-700 transition-colors"
                >
                  {category.parent.name}
                </Link>
              </>
            )}
            <LuChevronLeft size={12} />
            <span className="text-neutral-800 font-bold">{category.name}</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-1.5 self-stretch rounded-full flex-none bg-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-1 text-neutral-500 text-sm max-w-xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-6">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex gap-2 items-stretch flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <InputRow icon={<LuSearch />} dir="rtl">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`جست و جو در زیرمجموعه‌های ${category.name}`}
                  className="input bg-white"
                />
              </InputRow>
            </div>
          </div>

          <div className="border-t border-white/60 mx-5 mb-1" />

          {filteredChildren.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              {children.length === 0
                ? "این دسته‌بندی زیرمجموعه‌ای ندارد."
                : "نتیجه‌ای برای جستجوی شما پیدا نشد."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-5 pt-3">
              {filteredChildren.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${category.slug}/${sub.slug}`}
                  className="group flex items-center justify-between bg-white rounded-xl px-3.5 py-2.5 border border-stone-200 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-neutral-800 group-hover:text-emerald-800 transition-colors">
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}