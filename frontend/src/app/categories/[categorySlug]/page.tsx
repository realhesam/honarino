"use client";

import InputRow from "@/ui/InputRow";
import LinkButton from "@/ui/LinkButton";
import Link from "next/link";
import { useState } from "react";
import {
  LuSearch,
  LuChevronLeft,
  LuSlidersHorizontal,
  LuX,
} from "react-icons/lu";

const CATEGORY = {
  id: "pottery",
  name: "سفال و ظروف",
  description:
    "ظروف سفالی، سرامیک، چینی و بدل‌چینی دست‌ساز ایرانی از بهترین کارگاه‌های کشور",
};

const subs = [
  { id: "all", name: "همه", count: 50 },
  { id: "pottery-bowl", name: "کاسه و بشقاب", count: 18 },
  { id: "vase", name: "گلدان", count: 30 },
  { id: "mug", name: "فنجان و ماگ", count: 29 },
  { id: "pot", name: "کوزه و سبو", count: 23 },
  { id: "ceramic-tile", name: "کاشی سرامیکی", count: 19 },
  { id: "teapot", name: "چایدان", count: 39 },
  { id: "decorative", name: "تزئینی", count: 29 },
  { id: "cookie", name: "شیرینی خوری", count: 20 },
  { id: "set", name: "سرویس کامل", count: 29 },
  { id: "box", name: "بانکه و باکس", count: 19 },
  { id: "money-box", name: "قلک پول", count: 8 },
  { id: "wall-bowl", name: "بشقاب دیواری", count: 42 },
  { id: "dizi-bowl", name: "ظرف دیزی", count: 7 },
];

export default function CategoryDetailPage() {
  const [activeSub, setActiveSub] = useState("all");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const allCities = [
    "مشهد",
    "همدان",
    "سمنان",
    "اصفهان",
    "ایلام",
    "تبریز",
    "ملایر",
    "تهران",
    "قم",
  ];

  function toggleCity(city: string) {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  }

  return (
    <div className="container mt-30 text-neutral-900">
      {/* Header of Category */}
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
            <LuChevronLeft size={12} />
            <span className="text-neutral-800 font-bold">{CATEGORY.name}</span>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-1.5 self-stretch rounded-full flex-none bg-primary`}
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {CATEGORY.name}
              </h1>
              <p className="mt-1 text-neutral-500 text-sm max-w-xl leading-relaxed">
                {CATEGORY.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden p-5 rounded-xl border border-stone-200 bg-white lg:flex flex-col gap-5 w-52 flex-none">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                شهر
              </h3>
              <ul className="space-y-1">
                {allCities.map((city) => (
                  <li key={city}>
                    <label className="flex items-center gap-2 cursor-pointer group text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={() => toggleCity(city)}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded"
                      />
                      {city}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filter Clear */}
            {(selectedCities.length > 0 || activeSub !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCities([]);
                  setActiveSub("all");
                }}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:underline"
              >
                <LuX size={12} />
                پاک کردن فیلترها
              </button>
            )}
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex gap-2 items-stretch flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <InputRow icon={<LuSearch />} dir="rtl">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`جست و جو در دسته بندی ${CATEGORY.name}`}
                    className="input bg-white"
                  />
                </InputRow>
              </div>

              <LinkButton
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                customClass={`lg:hidden px-3 py-2 text-sm transition-colors ${showFilters ? "border-none" : "bg-white text-stone-700 border border-stone-200 shadow-sm"}`}
              >
                <LuSlidersHorizontal size={15} />
                فیلتر
              </LinkButton>
            </div>

            {/* Mobile Filter Box */}
            {showFilters && (
              <div className="lg:hidden bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  شهر
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        selectedCities.includes(city)
                          ? "bg-emerald-700 text-white border-transparent"
                          : "bg-white text-neutral-600 border-neutral-200"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                {selectedCities.length > 0 && (
                  <button
                    onClick={() => setSelectedCities([])}
                    className="text-xs text-red-600 flex items-center gap-1"
                  >
                    <LuX size={11} /> پاک کردن
                  </button>
                )}
              </div>
            )}

            <div className="border-t border-white/60 mx-5 mb-1" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-5 pt-3">
              {subs.map((sub) => (
                <a
                  key={sub.id}
                  href={`/categories/${CATEGORY.id}/${sub.id}`}
                  className="group flex items-center justify-between bg-white rounded-xl px-3.5 py-2.5 border border-stone-200 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-neutral-800 group-hover:text-emerald-800 transition-colors">
                    {sub.name}
                  </span>
                  <span className="text-xs text-neutral-400 tabular-nums">
                    {sub.count.toLocaleString("fa-IR")}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
