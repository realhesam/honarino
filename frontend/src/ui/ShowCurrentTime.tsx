"use client";

import { toJalali } from "@/utils/functions/utilsFunctions";
import { useEffect, useState } from "react";

export default function ShowCurrentTime() {
  const [date, setDate] = useState<Date | string>("");
  useEffect(() => {
    setInterval(() => {
      setDate(new Date());
    }, 1000);
  }, []);

  return (
    <p className="p-2 rounded-lg bg-stone-200 text-stone-600">
      {toJalali(date)}
    </p>
  );
}
