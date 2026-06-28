"use client";

import InputRow from "@/ui/InputRow";
import LinkButton from "@/ui/LinkButton";
import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { HiEnvelope, HiMiniH1, HiUser } from "react-icons/hi2";
import {
  LuMail,
  LuPhone,
  LuMapPin,
  LuClock,
  LuSend,
  LuCheck,
} from "react-icons/lu";

const CONTACT_INFO = [
  { icon: LuMail, label: "ایمیل پشتیبانی", value: "support@example.com" },
  { icon: LuPhone, label: "تلفن", value: "021-12345678" },
  {
    icon: LuMapPin,
    label: "آدرس دفتر",
    value: "تهران، خیابان ولیعصر، پلاک ۱۲",
  },
  { icon: LuClock, label: "ساعت پاسخگویی", value: "شنبه تا چهارشنبه، ۹ تا ۱۷" },
];

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [sent, setSent] = useState(false);

  function update(field: keyof ContactForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log("[contact-admins] payload:", form);
    setSent(true);
    setForm(INITIAL_FORM);
  }

  return (
    <main dir="rtl" lang="fa" className="mt-20 text-neutral-900">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-12 text-center">
          <h1 className="text-1xl sm:text-2xl font-extrabold tracking-tight">
            تماس با ما
          </h1>
          <p className="mt-3 text-neutral-600 max-w-md mx-auto">
            این بخش برای تماس با تیم سایت است، نه با فروشگاه‌ها. برای ارتباط با
            یک فروشگاه خاص، به صفحه‌ی همان فروشگاه مراجعه کنید.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10">
          <div className="space-y-6">
            {CONTACT_INFO.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 bg-white p-5 rounded-xl shadow"
              >
                <div className="w-11 h-11 flex-none rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center">
                  <item.icon size={20} />
                </div>
                <div>
                  <div className="text-sm text-neutral-500">{item.label}</div>
                  <div className="font-bold">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-neutral-200 shadow rounded-2xl p-6 sm:p-8">
            {sent && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-100 text-emerald-800 px-4 py-3 text-sm font-bold">
                <LuCheck size={18} />
                پیام شما ارسال شد. تیم ما به‌زودی پاسخ می‌دهد.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputRow label="نام و نام خانوادگی" htmlFor="name">
                  <div className="relative flex items-center">
                    <HiUser className="absolute right-3.5 size-4.5 text-stone-400" />
                    <input
                      className={`input pr-10`}
                      name="name"
                      id="name"
                      type="text"
                      placeholder="نام خود را وارد کنید"
                      required
                    />
                  </div>
                </InputRow>
                <InputRow label="ایمیل" htmlFor="email">
                  <div className="relative flex items-center">
                    <HiEnvelope className="absolute left-3.5 size-4.5 text-stone-400 z-10" />
                    <input
                      className={`input`}
                      type="email"
                      name="email"
                      id="email"
                      placeholder="example@domain.com"
                      dir="ltr"
                    />
                  </div>
                </InputRow>
              </div>

              <InputRow label="موضوع" htmlFor="subject">
                <div className="relative flex items-center">
                  <HiMiniH1 className="absolute right-3.5 size-4.5 text-stone-400" />
                  <input
                    className={`input pr-10`}
                    name="subject"
                    id="subject"
                    type="text"
                    placeholder="عنوان سوال را بنویسید"
                    required
                  />
                </div>
              </InputRow>

              <InputRow label="پیام">
                <textarea
                  required
                  rows={5}
                  placeholder="متن سوال خود را وارد کنید"
                  value={form.message}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    update("message", e.target.value)
                  }
                  className="input"
                />
              </InputRow>

              <div className="flex justify-center">
                <LinkButton type="submit">
                  ارسال پیام
                  <LuSend size={16} />
                </LinkButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
