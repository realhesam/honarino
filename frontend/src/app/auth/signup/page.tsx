"use client";

import { AppError } from "@/lib/core/errors/AppError";
import { AuthService } from "@/lib/modules/auth/auth.service";
import InputRow from "@/ui/InputRow";
import LinkButton from "@/ui/LinkButton";
import { useNotification } from "@/utils/useNotification";
import { useState } from "react";
import { HiEnvelope, HiIdentification, HiKey, HiUser } from "react-icons/hi2";

function Page() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeat_password, setRepeatPassword] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const notification = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await AuthService.signup({
        name,
        email,
        username,
        password,
        repeat_password,
      });

      notification.success("اکانت شما با موفقیت ساخته شد اکنون وارد شوید");
    } catch (error) {
      if (error instanceof AppError) {
        notification.error(error.message);
      } else {
        notification.error("خطای غیرمنتظره‌ای رخ داد");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-5"
      >
        <InputRow dir="rtl" icon={<HiIdentification />}>
          <input
            type="text"
            placeholder="نام و نام خانوادگی"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </InputRow>

        <InputRow dir="rtl" icon={<HiUser />}>
          <input
            type="text"
            placeholder="نام کاربری"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </InputRow>

        <InputRow dir="rtl" icon={<HiKey />}>
          <input
            type="password"
            placeholder="رمزعبور"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputRow>

        <InputRow dir="rtl" icon={<HiKey />}>
          <input
            type="password"
            placeholder="تکرار کلمه عبور"
            className="input"
            value={repeat_password}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </InputRow>

        <InputRow dir="rtl" icon={<HiEnvelope />}>
          <input
            type="text"
            placeholder="ایمیل"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </InputRow>

        <div className="w-full flex items-center">
          <LinkButton
            customClass="!w-full h-10 flex items-center justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? "در حال ثبت نام..." : "ثبت نام"}
          </LinkButton>
        </div>
      </form>
    </div>
  );
}

export default Page;
