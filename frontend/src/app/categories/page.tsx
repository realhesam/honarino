"use client";

import InputRow from "@/ui/InputRow";
import LinkButton from "@/ui/LinkButton";
import Link from "next/link";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  LuChevronLeft,
  LuSearch,
  LuLayoutList,
  LuArrowLeft,
} from "react-icons/lu";
import { CategoryService } from "@/lib/modules/category/category.service";
import { CategoryResponse } from "@/lib/modules/category/category.types";

interface CategoryWithChildren extends CategoryResponse {
  children: CategoryResponse[];
}

export default function CategoriesPage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rootsResponse = await CategoryService.list_root_categories();
      const roots = rootsResponse.data ?? [];

      const withChildren = await Promise.all(
        roots.map(async (root) => {
          try {
            const childrenResponse = await CategoryService.list_child_categories(root.id);
            return { ...root, children: childrenResponse.data ?? [] };
          } catch {
            return { ...root, children: [] };
          }
        })
      );

      setCategories(withChildren);
    } catch (err) {
      setError("خطا در بارگذاری دسته‌بندی‌ها؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        c.children.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [query, categories]);

  const totalSubcategories = categories.reduce((acc, c) => acc + c.children.length, 0);

  if (isLoading) {
    return (
      <div dir="rtl" lang="fa" className="mt-30 min-h-screen text-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="text-center py-24 text-neutral-400 animate-pulse">
            در حال بارگذاری دسته‌بندی‌ها...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" lang="fa" className="mt-30 min-h-screen text-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="text-center py-24 text-rose-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" lang="fa" className="mt-30 min-h-screen text-neutral-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            دسته‌بندی محصولات
          </h1>
          <p className="text-neutral-500">
            {categories.length.toLocaleString("fa-IR")} دسته‌بندی اصلی ·{" "}
            {totalSubcategories.toLocaleString("fa-IR")} زیرمجموعه
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          <InputRow dir="rtl" icon={<LuSearch />}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی دسته‌بندی…"
              className="input bg-white"
            />
          </InputRow>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            نتیجه‌ای پیدا نشد.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cat) => {
              const isOpen = expanded === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`relative rounded-2xl overflow-hidden transition-shadow bg-white border border-stone-200 ${isOpen ? "shadow-md" : "shadow-sm hover:shadow-md"}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(cat.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 rounded-2xl"
                  >
                    <div
                      className={`absolute -right-1.5 w-3 h-10 top-4.5 rounded-full bg-primary`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-extrabold text-base">
                          {cat.name}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {cat.children.length.toLocaleString("fa-IR")} زیرمجموعه
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-1">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    {cat.children.length > 0 && (
                      <div className="hidden sm:flex gap-1.5 flex-none">
                        {cat.children.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className="text-xs bg-white border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full"
                          >
                            {s.name}
                          </span>
                        ))}
                        {cat.children.length > 3 && (
                          <span className="text-xs text-neutral-400 self-center">
                            +{cat.children.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <LuChevronLeft
                      size={18}
                      className={`flex-none text-neutral-400 transition-transform duration-200 ${isOpen ? "-rotate-90" : ""}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden bg-stone-100 transition-all duration-300 ${
                      isOpen ? "max-h-[600px]" : "max-h-0"
                    }`}
                  >
                    <div className="border-t border-white/60 mx-5 mb-1" />

                    {cat.children.length === 0 ? (
                      <p className="px-5 pb-5 pt-3 text-xs text-neutral-400">
                        این دسته‌بندی زیرمجموعه‌ای ندارد.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 pb-5 pt-3">
                        {cat.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categories/${cat.slug}/${sub.slug}`}
                            className="group flex items-center justify-between bg-white rounded-xl px-3.5 py-2.5 border border-stone-200 hover:border-emerald-300 hover:shadow-sm transition-all"
                          >
                            <span className="text-sm font-bold text-neutral-800 group-hover:text-emerald-800 transition-colors">
                              {sub.name}
                            </span>
                          </Link>
                        ))}

                        <LinkButton href={`/categories/${cat.slug}`}>
                          مشاهده همه
                          <LuArrowLeft size={14} />
                        </LinkButton>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-neutral-400 justify-center pt-2">
          <LuLayoutList size={14} />
          برای دیدن زیرمجموعه‌ها روی هر دسته کلیک کنید
        </div>
      </div>
    </div>
  );
}