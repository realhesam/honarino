"use client";

import ProductList from "@/components/product/ProductList";
import InputRow from "@/ui/InputRow";
import LinkButton from "@/ui/LinkButton";
import Modal from "@/ui/Modal";
import Pagination from "@/ui/Pagination";
import { useState } from "react";
import { FiSliders, FiRefreshCw, FiInbox } from "react-icons/fi";
import {
  HiAdjustmentsHorizontal,
  HiCube,
  HiMapPin,
  HiMiniMagnifyingGlass,
  HiMiniSquares2X2,
  HiMiniTag,
} from "react-icons/hi2";

const categories = [
  "مبلمان",
  "صنایع دستی",
  "صنایع چوب",
  "سفال",
  "فرش",
  "بافتنی",
];

const cities = ["تهران", "اصفهان", "شیراز", "تبریز", "یزد", "کاشان", "مشهد"];

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "cheap", label: "ارزان‌ترین" },
  { value: "bestseller", label: "پرفروش‌ترین" },
  { value: "popular", label: "محبوب‌ترین" },
];

const products = Array.from({ length: 10 }, (_, i) => {
  return {
    id: i,
    cover: "/images/product.jpg",
    alt: "تصویر مبل راحتی رویال",
    name: "مبل ال راحتی رویال",
    builder: "تولیدی مبلمان آقای علیسواری",
    slug: "mbl-al-kapr",
    caption:
      "مبل ال کاپر یکی از انواع مبل‌های ال ساده و مینیمال است که به دلیل سادگی در طراحی و سبک متفاوتی که دارد مورد توجه قرار گرفته و فروش خوبی در بازار داشته است. مبل‌های مینیمال قابلیت استفاده در انواع فضاها را برای خریدار فراهم میکنند و مبل ال کاپر برای افرادی که فضای کمی دارند انتخابی مناسب، اقتصادی، زیبا و به روز است. ",
    category: "مبلمان",
    rate: 4.5,
    price: 21000000,
    offerPrice: 20000000,
    offer: 4,
  };
});

function ProductsHeader() {
  const [selectedCity, setSelectedCity] = useState("همه");
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const activeFilterCount = [
    selectedCity !== "همه",
    selectedCategory !== "همه",
    maxPrice !== "",
    searchTerm.trim() !== "",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedCity("همه");
    setSelectedCategory("همه");
    setSortBy("newest");
    setMaxPrice("");
    setSearchTerm("");
  };
  return (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
      <InputRow icon={<HiMiniMagnifyingGlass />} dir="rtl" customClass="mb-3">
        <input
          type="text"
          className="input"
          placeholder="نام محصول مورد نظر خود را وارد کنید"
        />
      </InputRow>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InputRow icon={<HiMapPin />} dir="rtl">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input"
          >
            <option value="همه">همه شهرها</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </InputRow>

        <InputRow icon={<HiMiniSquares2X2 />} dir="rtl">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input"
          >
            <option value="همه">همه دسته‌ها</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </InputRow>

        <InputRow icon={<HiMiniTag />} dir="rtl">
          <input
            type="text"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="بدون محدودیت"
            className="input h-11"
          />
        </InputRow>

        <InputRow icon={<HiAdjustmentsHorizontal />} dir="rtl">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </InputRow>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-2">
        <div className="flex flex-col sm:flex-row items-center gap-1.5 text-xs sm:text-sm text-gray-500">
          <FiSliders className="h-4 w-4" />
          <span>
            {29} محصول یافت شد
            {activeFilterCount > 0 && ` · ${activeFilterCount} فیلتر فعال`}
          </span>
        </div>
        <button
          onClick={resetFilters}
          className="flex flex-col sm:flex-row items-center gap-1.5 text-xs sm:text-sm text-emerald-600 hover:text-emerald-700"
        >
          <FiRefreshCw className="h-3.5 w-3.5" />
          پاک کردن فیلترها
        </button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="container mt-28">
      <div className="hidden lg:block">
        <ProductsHeader />
      </div>
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <h3 className="text-xl font-medium">
          <span className="*:size-6 text-stone-400">
            <HiCube />
          </span>
          <span className="text-stone-600">صفحه محصولات</span>
        </h3>
        <Modal>
          <Modal.Open name="products-header">
            <LinkButton>مشاهده فیلتر ها</LinkButton>
          </Modal.Open>
          <Modal.Window name="products-header">
            <ProductsHeader />
          </Modal.Window>
        </Modal>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <FiInbox className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">محصولی پیدا نشد</p>
        </div>
      ) : (
        <ProductList products={products} />
      )}
      <Pagination totalItems={products.length + 10} pageSize={5} />
    </div>
  );
}
