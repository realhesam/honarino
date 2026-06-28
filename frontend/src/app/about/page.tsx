"use client";

import LinkButton from "@/ui/LinkButton";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  LuLink,
  LuGift,
  LuEye,
  LuShieldCheck,
  LuHeadset,
  LuChartColumn,
  LuQuote,
  LuArrowLeft,
  LuChevronDown,
} from "react-icons/lu";

const STATS = [
  { value: "12000+", label: "تولیدی فعال" },
  { value: "2500000+", label: "محصول در بازار" },
  { value: "98%", label: "رضایت خریداران" },
  { value: "5", label: "استان تحت پوشش" },
];

interface Feature {
  icon: IconType;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: LuLink,
    title: "ارتباط مستقیم",
    description: "بدون واسطه با خریدار حرف بزن و سفارش بگیر.",
  },
  {
    icon: LuGift,
    title: "راه‌اندازی رایگان",
    description: "ساخت تولیدی هیچ هزینه‌ی اولیه‌ای ندارد.",
  },
  {
    icon: LuEye,
    title: "دیده‌شدن بیشتر",
    description: "محصولاتت در دسته‌بندی‌های پربازدید قرار می‌گیرد.",
  },
  {
    icon: LuShieldCheck,
    title: "پرداخت امن",
    description: "هر تراکنش از درگاه‌های معتبر بانکی عبور می‌کند.",
  },
  {
    icon: LuHeadset,
    title: "پشتیبانی واقعی",
    description: "یک تیم واقعی، نه ربات، پاسخ‌گوی توست.",
  },
  {
    icon: LuChartColumn,
    title: "رشد قابل اندازه‌گیری",
    description: "آمار بازدید و فروش تولیدی ات را همیشه می‌بینی.",
  },
];

interface ProcessStep {
  title: string;
  description: string;
}

const PROCESS: ProcessStep[] = [
  { title: "ثبت‌نام کن", description: "یک حساب کاربری معمولی در سایت بساز." },
  {
    title: "فرم ارتقا را تکمیل کن",
    description: "اطلاعات تولیدی و تولیدت را وارد کن.",
  },
  {
    title: "منتظر تایید بمان",
    description: "تیم ما درخواستت را بررسی می‌کند.",
  },
  {
    title: "تولیدی ات را باز کن",
    description: "صفحه‌ی فروشگاهت برای همه فعال می‌شود.",
  },
];

interface Testimonial {
  quote: string;
  name: string;
  shop: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "از روز اول، مشتری‌ها مستقیم با من پیام می‌دادند. هیچ واسطه‌ای وسط نبود.",
    name: "مریم رضایی",
    shop: "تولیدی چرم‌دوز",
  },
  {
    quote:
      "ثبت‌نام و تایید تولیدی کمتر از یک هفته طول کشید. توقع این‌قدر سادگی رو نداشتم.",
    name: "امیر صالحی",
    shop: "غرفه‌ی چوب و چرم",
  },
  {
    quote:
      "آماری که از بازدید تولیدی ام دیدم کمکم کرد بفهمم کدوم محصولات پرفروش‌ترن.",
    name: "نگار احمدی",
    shop: "غرفه‌ی پودینه",
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "ثبت‌نام و ارتقا به فروشنده چقدر طول می‌کشد؟",
    answer:
      "پر کردن فرم چند دقیقه بیشتر طول نمی‌کشد. بعد از ارسال، بررسی درخواست معمولاً بین یک تا سه روز کاری انجام می‌شود.",
  },
  {
    question: "آیا باز کردن تولیدی هزینه دارد؟",
    answer:
      "نه، ساخت تولیدی کاملاً رایگان است. فقط در زمان فروش، کارمزد کوچکی از هر تراکنش کسر می‌شود.",
  },
  {
    question: "چطور وضعیت درخواستم را پیگیری کنم؟",
    answer:
      "از پنل کاربری خودت، بخش «وضعیت درخواست فروشندگی» وضعیت لحظه‌ای درخواست را نشان می‌دهد.",
  },
  {
    question: "بعد از تایید هم می‌توانم اطلاعات تولیدی را ویرایش کنم؟",
    answer:
      "بله. هر زمان که بخواهی، از پنل فروشنده می‌توانی نام، توضیحات، دسته‌بندی‌ها و اطلاعات تماس را به‌روز کنی.",
  },
  {
    question: "اگر مشتری از محصول راضی نباشد چه می‌شود؟",
    answer:
      "تیم پشتیبانی بین خریدار و فروشنده میانجی می‌شود و طبق قوانین بازگشت کالا عمل می‌کند.",
  },
];

function BazaarSkyline() {
  const stalls = [
    { x: 0, w: 46, h: 78, fill: "fill-emerald-100" },
    { x: 50, w: 38, h: 110, fill: "fill-emerald-600" },
    { x: 92, w: 50, h: 92, fill: "fill-emerald-200" },
    { x: 146, w: 42, h: 130, fill: "fill-emerald-700" },
    { x: 192, w: 46, h: 86, fill: "fill-emerald-100" },
    { x: 242, w: 40, h: 104, fill: "fill-emerald-300" },
    { x: 286, w: 48, h: 70, fill: "fill-emerald-600" },
  ];

  return (
    <svg viewBox="0 0 340 160" className="w-full h-auto" aria-hidden="true">
      {stalls.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${160 - s.h})`}>
          <rect
            x="0"
            y="14"
            width={s.w}
            height={s.h - 14}
            rx="3"
            className={s.fill}
          />
          <path
            d={`M-4 14 L${s.w / 2} -8 L${s.w + 4} 14 Z`}
            className={s.fill}
          />
          <path
            d={`M-4 14 L${s.w + 4} 14`}
            stroke="white"
            strokeWidth="3"
            strokeDasharray="6 6"
            opacity="0.6"
          />
        </g>
      ))}
    </svg>
  );
}

export default function AboutPage() {
  return (
    <main dir="rtl" lang="fa" className="bg-white text-neutral-900">
      <Hero />
      <Stats />
      <Mission />
      <Features />
      <Process />
      <Testimonials />
      <Faq />
      <ClosingCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="mt-18 border-b border-neutral-200 bg-linear-to-b from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-1.5 mb-6">
            یک سقف، صدها تولیدی
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold leading-tight tracking-tight text-neutral-900">
            هر تولیدی این بازار، پشتش یک آدم واقعی دارد
          </h1>
          <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-xl">
            ما بازاری ساختیم که در آن صاحبان کسب‌وکارهای کوچک مستقیم محصولات‌شان
            را به دست خریدار می‌رسانند؛ بدون واسطه، بدون پیچیدگی.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href="#process">
              تولیدی را راه‌اندازی کن
              <LuArrowLeft className="w-4 h-4" />
            </LinkButton>
            <LinkButton href="#" variation="btn-secondary" size="btn-lg">
              گردش در تولیدی ها
            </LinkButton>
          </div>
        </div>

        <div className="hidden sm:block">
          <BazaarSkyline />
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="text-center flex flex-col items-center lg:text-start"
          >
            <div className="text-3xl sm:text-4xl font-extrabold text-primary tabular-nums">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-neutral-500">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section className="border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          از یک ایده‌ی ساده شروع شد
        </h2>
        <p className="mt-5 text-lg text-neutral-600 leading-relaxed">
          بازارهای سنتی همیشه یک ویژگی مشترک داشتند: هر تولیدی مستقیم با مشتری
          حرف می‌زد. ما همان ایده را آنلاین کردیم. به‌جای یک فروشگاه بزرگ با
          هزاران محصول بی‌نام، بازاری ساختیم از غرفه‌های مستقل که هرکدام صاحب،
          داستان و محصول خودش را دارد.
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center mb-12">
          چرا اینجا تولیدی باز کنی؟
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 rounded-2xl overflow-hidden border border-neutral-200">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white p-8 hover:bg-emerald-50 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="mt-2 text-neutral-600 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center mb-16">
          چطور تولیدی ات را باز کنی
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {PROCESS.map((p, i) => (
            <div key={p.title} className="relative">
              {i !== 0 && (
                <div className="hidden lg:block absolute top-6 -right-3 w-6 border-t-2 border-dashed border-emerald-200" />
              )}
              <div className="w-12 h-12 rounded-full bg-emerald-700 text-white font-extrabold text-lg grid place-items-center">
                {i}
              </div>
              <h3 className="mt-4 font-bold text-lg">{p.title}</h3>
              <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center mb-12">
          از زبان صاحبان تولیدی ها
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="bg-white border border-neutral-200 rounded-2xl p-7"
            >
              <LuQuote className="w-7 h-7 text-emerald-300" />
              <blockquote className="mt-3 text-neutral-800 leading-relaxed">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-bold text-neutral-900">{t.name}</span>
                <span className="text-neutral-500"> — {t.shop}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-b border-neutral-200">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center mb-12">
          سوالات پرتکرار
        </h2>
        <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 py-5 text-start font-bold text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 focus-visible:rounded-md"
                >
                  {item.question}
                  <LuChevronDown
                    className={`w-5 h-5 flex-none text-emerald-700 transition-transform motion-reduce:transition-none ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 motion-reduce:transition-none ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <p className="pb-5 text-neutral-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="bg-primary">
      <div className="flex flex-col items-center max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          همین حالا تولیدی خودت را باز کن
        </h2>
        <p className="mt-4 text-emerald-100 text-lg">
          چند دقیقه وقت بگذار، بقیه‌اش با ماست.
        </p>
        <LinkButton
          href="/upgrade-to-production"
          variation="btn-light"
          customClass="w-fit mt-6"
        >
          شروع کن
          <LuArrowLeft className="w-4 h-4" />
        </LinkButton>
      </div>
    </section>
  );
}
