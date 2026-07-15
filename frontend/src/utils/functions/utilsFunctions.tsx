export function toJalali(dateInput: Date | string) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    return "در حال بارگیری ...";
  }

  const fmt = new Intl.DateTimeFormat("en-US", {
    calendar: "persian",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = fmt.formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes): string => {
    const part = parts.find((p) => p.type === type);
    return part?.value ?? "";
  };

  const year = get("year");
  const month = get("month");
  const day = get("day");
  let hour = get("hour");
  const minute = get("minute");

  if (hour === "24") hour = "00";

  return `${hour}:${minute} - ${day}/${month}/${year}`;
}