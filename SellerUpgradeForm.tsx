"use client";

import { useId, useMemo, useRef, useState } from "react";
// import {
//   HiOutlineMapPin,
//   HiOutlineGlobe,
//   HiOutlineCheck,
//   HiOutlinePencil,
//   HiOutlineXMark,
//   HiOutlineChevronLeft,
// } from "react-icons/hi";
// import { FaTelegram, FaWhatsapp } from "";
// import { MdOutlineChatBubble } from "react-icons/md";
// import { GiPlantRoots } from "react-icons/gi";

/* ----------------------------------------------------------------------- *
 *  Types
 * ----------------------------------------------------------------------- */

type StepKey = "identity" | "categories" | "production" | "online" | "review";

interface StepDef {
  key: StepKey;
  title: string;
  subtitle: string;
}

interface FormState {
  shopName: string;
  shopDescription: string;
  categories: string[];
  productionAddress: string;
  productionPhone: string;
  productionEmail: string;
  telegram: string;
  rubika: string;
  eitaa: string;
  whatsapp: string;
  website: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

type RailMarkerState = "upcoming" | "current" | "done";

interface SocialField {
  key: keyof Pick<FormState, "telegram" | "rubika" | "eitaa" | "whatsapp">;
  label: string;
  placeholder: string;
  Icon: React.ComponentType<{ className?: string }>;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  id: string;
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  error?: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  error?: string;
}

interface RailProps {
  steps: StepDef[];
  current: number;
  maxReached: number;
  onSelect: (idx: number) => void;
}

interface MobileProgressProps {
  current: number;
  total: number;
  percent: number;
  title: string;
}

interface StepIdentityProps {
  form: FormState;
  errors: FormErrors;
  update: (field: keyof FormState, value: string) => void;
  uid: string;
}

interface StepCategoriesProps {
  form: FormState;
  errors: FormErrors;
  tagDraft: string;
  setTagDraft: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  addCategory: (v: string) => void;
  removeCategory: (v: string) => void;
  uid: string;
}

interface StepProductionProps {
  form: FormState;
  errors: FormErrors;
  update: (field: keyof FormState, value: string) => void;
  uid: string;
}

interface StepOnlineProps {
  form: FormState;
  errors: FormErrors;
  update: (field: keyof FormState, value: string) => void;
  uid: string;
}

interface StepReviewProps {
  form: FormState;
  onEditStep: (idx: number) => void;
}

interface SuccessScreenProps {
  form: FormState;
  onEdit: () => void;
}

/* ----------------------------------------------------------------------- *
 *  Constants
 * ----------------------------------------------------------------------- */

const STEP_DEFS: StepDef[] = [
  {
    key: "identity",
    title: "هویت فروشگاه",
    subtitle: "فروشگاه‌تان را به خریدارها معرفی کنید",
  },
  {
    key: "categories",
    title: "دسته‌بندی محصولات",
    subtitle: "چه محصولاتی عرضه می‌کنید؟",
  },
  {
    key: "production",
    title: "اطلاعات تولیدی",
    subtitle: "راه ارتباطی با واحد تولید یا کارگاه",
  },
  {
    key: "online",
    title: "حضور آنلاین",
    subtitle: "شبکه‌های اجتماعی و وبسایت فروشگاه",
  },
  {
    key: "review",
    title: "بازبینی و ارسال",
    subtitle: "یک نگاه آخر قبل از ثبت درخواست",
  },
];

const SUGGESTED_CATEGORIES: string[] = [
  "پوشاک",
  "کیف و کفش",
  "لوازم خانگی",
  "خوراکی و آشامیدنی",
  "آرایشی و بهداشتی",
  "دیجیتال و الکترونیک",
  "صنایع دستی",
  "لوازم ورزشی",
  "کودک و نوزاد",
  "کتاب و لوازم‌التحریر",
];

const MAX_CATEGORIES = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s]{7,16}$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}([/?#].*)?$/i;

const SOCIAL_FIELDS: SocialField[] = [
  {
    key: "telegram",
    label: "تلگرام",
    placeholder: "@nameshop یا لینک کانال",
    Icon: ({ className }) => <RiTelegram2Fill className={className} />,
  },
  {
    key: "rubika",
    label: "روبیکا",
    placeholder: "@nameshop یا لینک پیج",
    Icon: ({ className }) => <MdOutlineChatBubble className={className} />,
  },
  {
    key: "eitaa",
    label: "ایتا",
    placeholder: "@nameshop یا لینک پیج",
    Icon: ({ className }) => <MdOutlineChatBubble className={className} />,
  },
  {
    key: "whatsapp",
    label: "واتساپ",
    placeholder: "شماره با کد کشور، مثل ۹۸۹۱۲...",
    Icon: ({ className }) => <FaWhatsapp className={className} />,
  },
];

const INITIAL_FORM: FormState = {
  shopName: "",
  shopDescription: "",
  categories: [],
  productionAddress: "",
  productionPhone: "",
  productionEmail: "",
  telegram: "",
  rubika: "",
  eitaa: "",
  whatsapp: "",
  website: "",
};

/* ----------------------------------------------------------------------- *
 *  Shared Tailwind class strings
 * ----------------------------------------------------------------------- */

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 focus-visible:rounded-md";

const INPUT_BASE =
  "w-full bg-gray-50 border border-gray-200 rounded-xl py-[11px] px-[14px] text-sm font-sans text-gray-900 " +
  "transition-colors duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none motion-reduce:transition-none";

const INPUT_ERROR = "border-red-400";

const ICON_INPUT_BASE =
  "flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-[14px] " +
  "transition-colors duration-150 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 motion-reduce:transition-none";

const BTN_BASE =
  "inline-flex items-center gap-2 text-sm font-bold rounded-xl py-[11px] px-5 " +
  "border border-transparent cursor-pointer transition-transform duration-100 active:scale-[0.97] " +
  `disabled:opacity-40 disabled:cursor-not-allowed motion-reduce:transition-none ${FOCUS_RING}`;

const BTN_PRIMARY = "bg-emerald-700 text-white hover:bg-emerald-800";

const BTN_GHOST =
  "bg-transparent text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-800 " +
  "disabled:hover:border-gray-200 disabled:hover:text-gray-500";

/* ----------------------------------------------------------------------- *
 *  Helpers
 * ----------------------------------------------------------------------- */

function toFa(n: number): string {
  return n.toLocaleString("fa-IR");
}

/* ----------------------------------------------------------------------- *
 *  Reusable sub-components
 * ----------------------------------------------------------------------- */

function Field({ label, hint, error, required, children, id }: FieldProps) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-[7px]">
        <label htmlFor={id} className="text-[13.5px] font-bold text-gray-900">
          {label}
          {required ? (
            <span className="text-red-500 ms-[3px]">*</span>
          ) : (
            <span className="text-gray-400 font-normal text-[11.5px] ms-1.5">
              اختیاری
            </span>
          )}
        </label>
        {hint && !error && (
          <span className="font-mono text-[11px] text-gray-400">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-1.5 mb-0 text-[12px] text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput({ id, error, className = "", ...rest }: TextInputProps) {
  return (
    <input
      id={id}
      className={`${INPUT_BASE} ${error ? INPUT_ERROR : ""} ${FOCUS_RING} ${className}`}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={error ? `${id}-error` : undefined}
      {...rest}
    />
  );
}

function TextArea({ id, error, ...rest }: TextAreaProps) {
  return (
    <textarea
      id={id}
      className={`${INPUT_BASE} ${error ? INPUT_ERROR : ""} ${FOCUS_RING} resize-y min-h-[90px] leading-relaxed`}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={error ? `${id}-error` : undefined}
      {...rest}
    />
  );
}

/* ----------------------------------------------------------------------- *
 *  Rail (sidebar progress navigator)
 * ----------------------------------------------------------------------- */

const RAIL_MARKER_STATE: Record<RailMarkerState, string> = {
  upcoming: "border-gray-200 text-gray-400 bg-white",
  current:
    "border-emerald-500 text-emerald-800 bg-emerald-50 shadow-[0_0_0_4px_theme(colors.emerald.50)]",
  done: "border-emerald-500 bg-emerald-500 text-white",
};

function Rail({ steps, current, maxReached, onSelect }: RailProps) {
  return (
    <nav
      className="hidden min-[861px]:block sticky top-6 bg-white border border-gray-200 rounded-2xl px-[18px] py-[22px]"
      aria-label="مراحل تکمیل فرم فروشندگی"
    >
      <div className="flex items-center gap-2 text-emerald-800 font-bold text-[13px] mb-[18px] tracking-wide">
        <GiPlantRoots size={20} />
        <span>مسیر راه‌اندازی فروشگاه</span>
      </div>

      <ol className="list-none m-0 p-0 flex flex-col">
        {steps.map((s, i) => {
          const state: RailMarkerState =
            i < current ? "done" : i === current ? "current" : "upcoming";
          const reachable = i <= maxReached;

          return (
            <li key={s.key} className="relative">
              {i !== 0 && (
                <span
                  className={`absolute start-[14px] -top-[22px] w-[2px] h-[22px] ${
                    i <= current ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => onSelect(i)}
                disabled={!reachable}
                className={`w-full flex items-center gap-3 py-[10px] text-start rounded-xl transition-colors duration-150 motion-reduce:transition-none ${
                  reachable
                    ? "cursor-pointer hover:bg-emerald-50"
                    : "cursor-not-allowed opacity-50"
                } ${FOCUS_RING}`}
                aria-current={i === current ? "step" : undefined}
              >
                <span
                  className={`flex-none w-[30px] h-[30px] rounded-full grid place-items-center border-2 transition-all duration-200 motion-reduce:transition-none ${RAIL_MARKER_STATE[state]}`}
                >
                  {state === "done" ? (
                    <HiOutlineCheck size={14} />
                  ) : (
                    <span className="text-[11px] font-bold">{toFa(i + 1)}</span>
                  )}
                </span>
                <span className="flex flex-col min-w-0">
                  <span
                    className={`text-[13px] font-bold leading-snug truncate ${
                      i === current ? "text-emerald-800" : "text-gray-700"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="text-[11.5px] text-gray-400 truncate">
                    {s.subtitle}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ----------------------------------------------------------------------- *
 *  Mobile progress bar (shown below 861px)
 * ----------------------------------------------------------------------- */

function MobileProgress({
  current,
  total,
  percent,
  title,
}: MobileProgressProps) {
  return (
    <div className="min-[861px]:hidden mb-5">
      <div className="flex justify-between items-center mb-2 text-[12px] text-gray-400">
        <span>{title}</span>
        <span>
          {toFa(current + 1)} / {toFa(total)}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 *  Step: Identity
 * ----------------------------------------------------------------------- */

function StepIdentity({ form, errors, update, uid }: StepIdentityProps) {
  const nameId = `${uid}-shop-name`;
  const descId = `${uid}-shop-desc`;

  return (
    <div className="flex flex-col gap-5">
      <Field id={nameId} label="نام فروشگاه" required error={errors.shopName}>
        <TextInput
          id={nameId}
          value={form.shopName}
          onChange={(e) => update("shopName", e.target.value)}
          placeholder="مثلاً: فروشگاه پارچه سعادت"
          maxLength={80}
          error={errors.shopName}
        />
      </Field>

      <Field
        id={descId}
        label="توضیحات فروشگاه"
        required
        error={errors.shopDescription}
        hint={`${toFa(form.shopDescription.length)} / ۵۰۰`}
      >
        <TextArea
          id={descId}
          value={form.shopDescription}
          onChange={(e) => update("shopDescription", e.target.value)}
          placeholder="چند جمله درباره فروشگاه، محصولات و مزیت شما بنویسید…"
          maxLength={500}
          error={errors.shopDescription}
        />
      </Field>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 *  Step: Categories
 * ----------------------------------------------------------------------- */

function StepCategories({
  form,
  errors,
  tagDraft,
  setTagDraft,
  onKeyDown,
  addCategory,
  removeCategory,
  uid,
}: StepCategoriesProps) {
  const inputId = `${uid}-cat-input`;

  return (
    <div className="flex flex-col gap-5">
      <Field
        id={inputId}
        label="دسته‌بندی‌های محصول"
        required
        error={errors.categories}
        hint={`${toFa(form.categories.length)} / ${toFa(MAX_CATEGORIES)}`}
      >
        <div
          className={`${ICON_INPUT_BASE} flex-wrap gap-2 py-2 ${
            errors.categories ? "border-red-400" : ""
          }`}
        >
          {form.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 rounded-lg px-2.5 py-1 text-[12.5px] font-bold"
            >
              {cat}
              <button
                type="button"
                onClick={() => removeCategory(cat)}
                aria-label={`حذف ${cat}`}
                className="text-emerald-600 hover:text-red-500 transition-colors"
              >
                <HiOutlineXMark size={13} />
              </button>
            </span>
          ))}
          <input
            id={inputId}
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              form.categories.length === 0
                ? "دسته‌بندی تایپ کنید و Enter بزنید"
                : ""
            }
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-[14px] text-gray-900 py-1"
            disabled={form.categories.length >= MAX_CATEGORIES}
          />
        </div>
      </Field>

      <div>
        <p className="text-[12.5px] text-gray-400 mb-2">
          پیشنهادها — روی هر مورد کلیک کنید:
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_CATEGORIES.map((cat) => {
            const selected = form.categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  selected ? removeCategory(cat) : addCategory(cat)
                }
                className={`text-[12.5px] rounded-lg px-3 py-1.5 border transition-colors duration-100 ${
                  selected
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-700"
                } ${FOCUS_RING}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 *  Step: Production
 * ----------------------------------------------------------------------- */

function StepProduction({ form, errors, update, uid }: StepProductionProps) {
  const addrId = `${uid}-prod-addr`;
  const phoneId = `${uid}-prod-phone`;
  const emailId = `${uid}-prod-email`;

  return (
    <div className="flex flex-col gap-5">
      <Field
        id={addrId}
        label="آدرس تولیدی / کارگاه"
        required
        error={errors.productionAddress}
      >
        <div
          className={`${ICON_INPUT_BASE} ${errors.productionAddress ? "border-red-400" : ""}`}
        >
          <HiOutlineMapPin size={18} className="text-gray-400 flex-none" />
          <input
            id={addrId}
            value={form.productionAddress}
            onChange={(e) => update("productionAddress", e.target.value)}
            placeholder="استان، شهر، خیابان…"
            className="flex-1 bg-transparent border-none outline-none py-[11px] text-[14px] text-gray-900"
          />
        </div>
        {errors.productionAddress && (
          <p className="mt-1.5 text-[12px] text-red-500" role="alert">
            {errors.productionAddress}
          </p>
        )}
      </Field>

      <Field
        id={phoneId}
        label="شماره تماس تولیدی"
        required
        error={errors.productionPhone}
      >
        <TextInput
          id={phoneId}
          type="tel"
          value={form.productionPhone}
          onChange={(e) => update("productionPhone", e.target.value)}
          placeholder="مثلاً ۰۲۱۱۲۳۴۵۶۷۸"
          error={errors.productionPhone}
          dir="ltr"
        />
      </Field>

      <Field
        id={emailId}
        label="ایمیل تولیدی"
        required
        error={errors.productionEmail}
      >
        <TextInput
          id={emailId}
          type="email"
          value={form.productionEmail}
          onChange={(e) => update("productionEmail", e.target.value)}
          placeholder="example@mail.com"
          error={errors.productionEmail}
          dir="ltr"
        />
      </Field>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 *  Step: Online presence
 * ----------------------------------------------------------------------- */

function StepOnline({ form, errors, update, uid }: StepOnlineProps) {
  const websiteId = `${uid}-website`;

  return (
    <div className="flex flex-col gap-5">
      {SOCIAL_FIELDS.map(({ key, label, placeholder, Icon: SocialIcon }) => {
        const fieldId = `${uid}-${key}`;
        return (
          <Field key={key} id={fieldId} label={label}>
            <div className={ICON_INPUT_BASE}>
              <SocialIcon className="text-gray-400 flex-none text-[18px]" />
              <input
                id={fieldId}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none outline-none py-[11px] text-[14px] text-gray-900"
                dir="ltr"
              />
            </div>
          </Field>
        );
      })}

      <Field id={websiteId} label="وبسایت" error={errors.website}>
        <div
          className={`${ICON_INPUT_BASE} ${errors.website ? "border-red-400" : ""}`}
        >
          <HiOutlineGlobe size={18} className="text-gray-400 flex-none" />
          <input
            id={websiteId}
            type="url"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://yourshop.ir"
            className="flex-1 bg-transparent border-none outline-none py-[11px] text-[14px] text-gray-900"
            dir="ltr"
          />
        </div>
        {errors.website && (
          <p className="mt-1.5 text-[12px] text-red-500" role="alert">
            {errors.website}
          </p>
        )}
      </Field>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 *  Step: Review
 * ----------------------------------------------------------------------- */

function ReviewRow({
  label,
  value,
  stepIdx,
  onEdit,
}: {
  label: string;
  value: React.ReactNode;
  stepIdx: number;
  onEdit: (idx: number) => void;
}) {
  return (
    <div className="flex justify-between items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-[12.5px] text-gray-400 flex-none w-28">
        {label}
      </span>
      <span className="text-[13.5px] text-gray-800 font-medium flex-1 break-words">
        {value || <span className="text-gray-300 italic">وارد نشده</span>}
      </span>
      <button
        type="button"
        onClick={() => onEdit(stepIdx)}
        className={`text-gray-400 hover:text-emerald-600 transition-colors ${FOCUS_RING}`}
        aria-label={`ویرایش ${label}`}
      >
        <HiOutlinePencil size={15} />
      </button>
    </div>
  );
}

function StepReview({ form, onEditStep }: StepReviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="text-[12px] font-bold text-emerald-700 uppercase tracking-widest mb-1">
          هویت فروشگاه
        </h3>
        <div className="bg-gray-50 rounded-xl px-4">
          <ReviewRow
            label="نام"
            value={form.shopName}
            stepIdx={0}
            onEdit={onEditStep}
          />
          <ReviewRow
            label="توضیحات"
            value={form.shopDescription}
            stepIdx={0}
            onEdit={onEditStep}
          />
        </div>
      </section>

      <section>
        <h3 className="text-[12px] font-bold text-emerald-700 uppercase tracking-widest mb-1">
          دسته‌بندی‌ها
        </h3>
        <div className="bg-gray-50 rounded-xl px-4">
          <ReviewRow
            label="دسته‌ها"
            value={
              form.categories.length ? form.categories.join("، ") : undefined
            }
            stepIdx={1}
            onEdit={onEditStep}
          />
        </div>
      </section>

      <section>
        <h3 className="text-[12px] font-bold text-emerald-700 uppercase tracking-widest mb-1">
          اطلاعات تولیدی
        </h3>
        <div className="bg-gray-50 rounded-xl px-4">
          <ReviewRow
            label="آدرس"
            value={form.productionAddress}
            stepIdx={2}
            onEdit={onEditStep}
          />
          <ReviewRow
            label="تلفن"
            value={form.productionPhone}
            stepIdx={2}
            onEdit={onEditStep}
          />
          <ReviewRow
            label="ایمیل"
            value={form.productionEmail}
            stepIdx={2}
            onEdit={onEditStep}
          />
        </div>
      </section>

      <section>
        <h3 className="text-[12px] font-bold text-emerald-700 uppercase tracking-widest mb-1">
          حضور آنلاین
        </h3>
        <div className="bg-gray-50 rounded-xl px-4">
          <ReviewRow
            label="تلگرام"
            value={form.telegram}
            stepIdx={3}
            onEdit={onEditStep}
          />
          <ReviewRow
            label="روبیکا"
            value={form.rubika}
            stepIdx={3}
            onEdit={onEditStep}
          />
          <ReviewRow
            label="ایتا"
            value={form.eitaa}
            stepIdx={3}
            onEdit={onEditStep}
          />
          <ReviewRow
            label="واتساپ"
            value={form.whatsapp}
            stepIdx={3}
            onEdit={onEditStep}
          />
          <ReviewRow
            label="وبسایت"
            value={form.website}
            stepIdx={3}
            onEdit={onEditStep}
          />
        </div>
      </section>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 *  Success Screen
 * ----------------------------------------------------------------------- */

function SuccessScreen({ form, onEdit }: SuccessScreenProps) {
  return (
    <div className="max-w-[480px] mx-auto text-center py-16 flex flex-col items-center gap-5">
      <span className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center text-emerald-600">
        <HiOutlineCheck size={34} strokeWidth={2.5} />
      </span>
      <h2 className="text-2xl font-extrabold text-gray-900">
        درخواست شما ثبت شد!
      </h2>
      <p className="text-sm text-gray-500 leading-relaxed">
        فروشگاه <strong className="text-gray-800">{form.shopName}</strong> با
        موفقیت ثبت شد. تیم ما به‌زودی با شما تماس خواهد گرفت.
      </p>
      <button
        type="button"
        onClick={onEdit}
        className={`${BTN_BASE} ${BTN_GHOST} mt-2`}
      >
        <HiOutlinePencil size={15} />
        ویرایش اطلاعات
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 *  Validation
 * ----------------------------------------------------------------------- */

function validateStep(idx: number, form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (idx === 0) {
    if (!form.shopName.trim()) errors.shopName = "نام فروشگاه را وارد کنید.";
    else if (form.shopName.trim().length < 2)
      errors.shopName = "نام فروشگاه خیلی کوتاه است.";

    if (!form.shopDescription.trim())
      errors.shopDescription = "توضیحات فروشگاه را وارد کنید.";
    else if (form.shopDescription.trim().length < 20)
      errors.shopDescription =
        "توضیحات را کمی کامل‌تر بنویسید (حداقل ۲۰ کاراکتر).";
  }

  if (idx === 1) {
    if (form.categories.length === 0)
      errors.categories = "حداقل یک دسته‌بندی اضافه کنید.";
  }

  if (idx === 2) {
    if (!form.productionAddress.trim())
      errors.productionAddress = "آدرس تولیدی را وارد کنید.";
    else if (form.productionAddress.trim().length < 10)
      errors.productionAddress = "آدرس را کامل‌تر وارد کنید.";

    if (!form.productionPhone.trim())
      errors.productionPhone = "شماره تماس تولیدی را وارد کنید.";
    else if (!PHONE_RE.test(form.productionPhone.trim()))
      errors.productionPhone = "شماره تماس را به‌صورت صحیح وارد کنید.";

    if (!form.productionEmail.trim())
      errors.productionEmail = "ایمیل تولیدی را وارد کنید.";
    else if (!EMAIL_RE.test(form.productionEmail.trim()))
      errors.productionEmail = "ایمیل را به‌صورت صحیح وارد کنید.";
  }

  if (idx === 3) {
    if (form.website.trim() && !URL_RE.test(form.website.trim()))
      errors.website = "آدرس وبسایت را به‌صورت صحیح وارد کنید.";
  }

  return errors;
}

/* ----------------------------------------------------------------------- *
 *  Main component
 * ----------------------------------------------------------------------- */

export default function SellerUpgradeForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const formTopRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  const totalSteps = STEP_DEFS.length;
  const step = STEP_DEFS[stepIndex];

  function update(field: keyof FormState, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function addCategory(raw: string) {
    const value = raw.trim();
    if (!value) return;
    if (form.categories.includes(value)) {
      setTagDraft("");
      return;
    }
    if (form.categories.length >= MAX_CATEGORIES) {
      setErrors((prev) => ({
        ...prev,
        categories: `حداکثر ${MAX_CATEGORIES} دسته‌بندی قابل انتخاب است.`,
      }));
      return;
    }
    update("categories", [...form.categories, value]);
    setTagDraft("");
  }

  function removeCategory(value: string) {
    update(
      "categories",
      form.categories.filter((c) => c !== value),
    );
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCategory(tagDraft);
    } else if (
      e.key === "Backspace" &&
      tagDraft === "" &&
      form.categories.length
    ) {
      removeCategory(form.categories[form.categories.length - 1]);
    }
  }

  function scrollToTop() {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goNext() {
    const stepErrors = validateStep(stepIndex, form);
    if (Object.keys(stepErrors).length) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      return;
    }
    const nextIndex = Math.min(stepIndex + 1, totalSteps - 1);
    setStepIndex(nextIndex);
    setMaxReached((prev) => Math.max(prev, nextIndex));
    scrollToTop();
  }

  function goBack() {
    setStepIndex((prev) => Math.max(prev - 1, 0));
    scrollToTop();
  }

  function goToStep(idx: number) {
    if (idx > maxReached) return;
    setStepIndex(idx);
    scrollToTop();
  }

  function handleSubmit() {
    let allErrors: FormErrors = {};
    let firstBadStep: number | null = null;

    for (let i = 0; i < totalSteps - 1; i += 1) {
      const stepErrors = validateStep(i, form);
      if (Object.keys(stepErrors).length && firstBadStep === null)
        firstBadStep = i;
      allErrors = { ...allErrors, ...stepErrors };
    }

    if (firstBadStep !== null) {
      setErrors(allErrors);
      setStepIndex(firstBadStep);
      setMaxReached((prev) => Math.max(prev, firstBadStep as number));
      scrollToTop();
      return;
    }

    // eslint-disable-next-line no-console
    console.log("[seller-upgrade] payload:", form);
    setSubmitted(true);
    scrollToTop();
  }

  const progressPercent = useMemo(
    () => (stepIndex / (totalSteps - 1)) * 100,
    [stepIndex, totalSteps],
  );

  const rootClasses =
    "font-sans text-gray-900 bg-gray-50 p-[clamp(16px,4vw,48px)] min-h-full";

  if (submitted) {
    return (
      <div className={rootClasses} dir="rtl" lang="fa" ref={formTopRef}>
        <SuccessScreen form={form} onEdit={() => setSubmitted(false)} />
      </div>
    );
  }

  return (
    <div className={rootClasses} dir="rtl" lang="fa" ref={formTopRef}>
      <div className="max-w-[980px] mx-auto grid grid-cols-1 min-[861px]:grid-cols-[260px_1fr] gap-7 items-start">
        <Rail
          steps={STEP_DEFS}
          current={stepIndex}
          maxReached={maxReached}
          onSelect={goToStep}
        />

        <div className="bg-white border border-gray-200 rounded-2xl p-[clamp(20px,3vw,36px)] flex flex-col min-h-[480px]">
          <MobileProgress
            current={stepIndex}
            total={totalSteps}
            percent={progressPercent}
            title={step.title}
          />

          <div className="mb-[22px]">
            <span className="font-mono text-[11.5px] tracking-wide text-emerald-800 font-semibold">
              مرحله {toFa(stepIndex + 1)} از {toFa(totalSteps)}
            </span>
            <h2 className="text-[22px] font-extrabold mt-1.5 mb-1">
              {step.title}
            </h2>
            <p className="text-[13.5px] text-gray-500 m-0">{step.subtitle}</p>
          </div>

          <div className="flex-1">
            {step.key === "identity" && (
              <StepIdentity
                form={form}
                errors={errors}
                update={update}
                uid={uid}
              />
            )}
            {step.key === "categories" && (
              <StepCategories
                form={form}
                errors={errors}
                tagDraft={tagDraft}
                setTagDraft={setTagDraft}
                onKeyDown={handleTagKeyDown}
                addCategory={addCategory}
                removeCategory={removeCategory}
                uid={uid}
              />
            )}
            {step.key === "production" && (
              <StepProduction
                form={form}
                errors={errors}
                update={update}
                uid={uid}
              />
            )}
            {step.key === "online" && (
              <StepOnline
                form={form}
                errors={errors}
                update={update}
                uid={uid}
              />
            )}
            {step.key === "review" && (
              <StepReview form={form} onEditStep={goToStep} />
            )}
          </div>

          <div className="flex justify-between gap-3 mt-7 pt-5 border-t border-gray-100 max-[560px]:flex-col-reverse">
            <button
              type="button"
              className={`${BTN_BASE} ${BTN_GHOST} max-[560px]:w-full max-[560px]:justify-center`}
              onClick={goBack}
              disabled={stepIndex === 0}
            >
              <HiOutlineChevronLeft size={16} className="rotate-180" />
              مرحله قبل
            </button>

            {stepIndex < totalSteps - 1 ? (
              <button
                type="button"
                className={`${BTN_BASE} ${BTN_PRIMARY} max-[560px]:w-full max-[560px]:justify-center`}
                onClick={goNext}
              >
                مرحله بعد
                <HiOutlineChevronLeft size={16} />
              </button>
            ) : (
              <button
                type="button"
                className={`${BTN_BASE} ${BTN_PRIMARY} max-[560px]:w-full max-[560px]:justify-center`}
                onClick={handleSubmit}
              >
                ثبت درخواست فروشندگی
                <HiOutlineCheck size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
