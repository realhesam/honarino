"use client";

import InputRow from "@/ui/InputRow";
import LinkButton from "@/ui/LinkButton";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  LuChevronLeft,
  LuSearch,
  LuLayoutList,
  LuArrowLeft,
} from "react-icons/lu";

// Fake Data of Category
interface Sub {
  id: string;
  name: string;
  count: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  subs: Sub[];
}

const CATEGORIES: Category[] = [
  {
    id: "furniture",
    name: "مبلمان و صندلی",
    description: "انواع مبل، صندلی و تخت‌خواب دست‌ساز ایرانی",
    subs: [
      { id: "royal", name: "سلطنتی", count: 48 },
      { id: "chesterfield", name: "چسترفیلد", count: 31 },
      { id: "round", name: "گرد", count: 19 },
      { id: "sofa-bed", name: "تخت‌خواب‌شو", count: 27 },
      { id: "single", name: "تک‌نفره", count: 54 },
      { id: "minimal", name: "مینیمال", count: 42 },
      { id: "outdoor", name: "فضای باز", count: 23 },
      { id: "office", name: "اداری", count: 36 },
    ],
  },
  {
    id: "carpet",
    name: "فرش و بافتنی",
    description: "فرش دستباف، گلیم، جاجیم و انواع بافتنی سنتی",
    subs: [
      { id: "handmade-carpet", name: "فرش دستباف", count: 87 },
      { id: "gelim", name: "گلیم", count: 43 },
      { id: "jajim", name: "جاجیم", count: 29 },
      { id: "kilim", name: "کیلیم", count: 18 },
      { id: "tablecloth", name: "رومیزی", count: 61 },
      { id: "rug", name: "پادری", count: 34 },
      { id: "cushion", name: "کوسن و کوبلت", count: 52 },
      { id: "tapestry", name: "تاپستری", count: 14 },
    ],
  },
  {
    id: "pottery",
    name: "سفال و ظروف",
    description: "ظروف سفالی، سرامیک، چینی و بدل‌چینی دست‌ساز",
    subs: [
      { id: "pottery-bowl", name: "کاسه و بشقاب", count: 76 },
      { id: "vase", name: "گلدان", count: 59 },
      { id: "mug", name: "فنجان و ماگ", count: 44 },
      { id: "pot", name: "کوزه و سبو", count: 28 },
      { id: "ceramic-tile", name: "کاشی سرامیکی", count: 21 },
      { id: "teapot", name: "چایدان", count: 37 },
      { id: "decorative", name: "تزئینی", count: 63 },
      { id: "set", name: "سرویس کامل", count: 19 },
    ],
  },
  {
    id: "handicrafts",
    name: "صنایع دستی",
    description: "مجسمه، مینیاتور، خاتم، معرق و سایر هنرهای دستی",
    subs: [
      { id: "sculpture", name: "مجسمه", count: 42 },
      { id: "miniature", name: "مینیاتور", count: 31 },
      { id: "khatam", name: "خاتم‌کاری", count: 24 },
      { id: "marquetry", name: "معرق", count: 17 },
      { id: "enamel", name: "میناکاری", count: 29 },
      { id: "calligraphy", name: "خوشنویسی", count: 38 },
      { id: "mosaic", name: "موزاییک", count: 15 },
      { id: "metal-craft", name: "آهنگری و مس", count: 22 },
    ],
  },
  {
    id: "wood",
    name: "صنایع چوبی",
    description: "مصنوعات چوبی، منبت‌کاری، حکاکی و وسایل تزئینی چوب",
    subs: [
      { id: "carving", name: "منبت‌کاری", count: 33 },
      { id: "engraving", name: "حکاکی", count: 26 },
      { id: "frame", name: "قاب و آینه", count: 47 },
      { id: "box", name: "جعبه و صندوق", count: 39 },
      { id: "wooden-toy", name: "اسباب‌بازی", count: 18 },
      { id: "kitchen-wood", name: "لوازم آشپزخانه", count: 54 },
      { id: "shelf", name: "شلف و طاقچه", count: 28 },
      { id: "clock", name: "ساعت دیواری", count: 21 },
    ],
  },
  {
    id: "clothing",
    name: "لباس و پوشاک",
    description: "پوشاک سنتی، پارچه دستباف، گیپور و دوخت‌های دست‌ساز",
    subs: [
      { id: "traditional", name: "لباس محلی", count: 58 },
      { id: "fabric", name: "پارچه دستباف", count: 41 },
      { id: "embroidery", name: "گلدوزی و سوزندوزی", count: 35 },
      { id: "scarf", name: "روسری و شال", count: 67 },
      { id: "coat", name: "کت و پالتو", count: 29 },
      { id: "accessories", name: "اکسسوری", count: 82 },
      { id: "hat", name: "کلاه و نقاب", count: 24 },
      { id: "kids", name: "کودک", count: 46 },
    ],
  },
  {
    id: "other",
    name: "سایر محصولات",
    description: "محصولاتی که در دسته‌بندی‌های دیگر جای نمی‌گیرند",
    subs: [
      { id: "candle", name: "شمع و عود", count: 38 },
      { id: "soap", name: "صابون طبیعی", count: 27 },
      { id: "jewelry", name: "زیورآلات", count: 91 },
      { id: "stone", name: "سنگ و کریستال", count: 19 },
      { id: "paper", name: "کاغذ دستباف", count: 12 },
      { id: "leather", name: "چرم‌دوزی", count: 44 },
      { id: "glass", name: "شیشه‌گری", count: 23 },
      { id: "resin", name: "رزین", count: 36 },
    ],
  },
];

export default function CategoriesPage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  // Client Side Search Function ( hesam age nemikhay ino pakesh con )
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (c) =>
        c.name.includes(q) ||
        c.description.includes(q) ||
        c.subs.some((s) => s.name.includes(q)),
    );
  }, [query]);

  const totalProducts = CATEGORIES.reduce(
    (acc, c) => acc + c.subs.reduce((a, s) => a + s.count, 0),
    0,
  );

  return (
    <div dir="rtl" lang="fa" className="mt-30 min-h-screen text-neutral-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            دسته‌بندی محصولات
          </h1>
          <p className="text-neutral-500">
            {totalProducts.toLocaleString("fa-IR")} محصول در {CATEGORIES.length}{" "}
            دسته‌بندی اصلی
          </p>
        </div>

        {/* Search  */}
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
              const total = cat.subs.reduce((a, s) => a + s.count, 0);

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
                          {total.toLocaleString("fa-IR")} محصول ·{" "}
                          {cat.subs.length} زیرمجموعه
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-1">
                        {cat.description}
                      </p>
                    </div>

                    {/* subcategory preview */}
                    <div className="hidden sm:flex gap-1.5 flex-none">
                      {cat.subs.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="text-xs bg-white border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full"
                        >
                          {s.name}
                        </span>
                      ))}
                      {cat.subs.length > 3 && (
                        <span className="text-xs text-neutral-400 self-center">
                          +{cat.subs.length - 3}
                        </span>
                      )}
                    </div>

                    <LuChevronLeft
                      size={18}
                      className={`flex-none text-neutral-400 transition-transform duration-200 ${isOpen ? "-rotate-90" : ""}`}
                    />
                  </button>

                  {/* Sub Category */}
                  <div
                    className={`overflow-hidden bg-stone-100 transition-all duration-300 ${
                      isOpen ? "max-h-[600px]" : "max-h-0"
                    }`}
                  >
                    <div className="border-t border-white/60 mx-5 mb-1" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 pb-5 pt-3">
                      {cat.subs.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/categories/${cat.id}/${sub.id}`}
                          className="group flex items-center justify-between bg-white rounded-xl px-3.5 py-2.5 border border-stone-200 hover:border-emerald-300 hover:shadow-sm transition-all"
                        >
                          <span className="text-sm font-bold text-neutral-800 group-hover:text-emerald-800 transition-colors">
                            {sub.name}
                          </span>
                          <span className="text-xs text-neutral-400 tabular-nums">
                            {sub.count.toLocaleString("fa-IR")}
                          </span>
                        </Link>
                      ))}

                      <LinkButton href={`/categories/${cat.id}`}>
                        مشاهده همه
                        <LuArrowLeft size={14} />
                      </LinkButton>
                    </div>
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
