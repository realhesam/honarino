import { cloneElement } from "react";

interface InputRowData {
  children: React.ReactNode;
  label?: string;
  icon?: React.ReactElement;
  htmlFor?: string;
  customClass?: string;
  customLabelClass?: string;
  dir?: "rtl" | "ltr";
}

function InputRow({
  children,
  label,
  icon,
  htmlFor,
  customClass,
  customLabelClass,
  dir = "ltr",
}: Readonly<InputRowData>) {
  let dirStyle = {};

  if (icon)
    dirStyle =
      dir === "rtl"
        ? { paddingRight: "40px", paddingLeft: "16px" }
        : { paddingLeft: "40px", paddingRight: "16px" };

  return (
    <div className={customClass}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={`text-stone-800 ${customLabelClass}`}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span
          className={`absolute *:size-4.5 text-stone-400 ${dir === "rtl" && icon ? "right-3.5" : "left-3.5"}`}
        >
          {icon}
        </span>
        {cloneElement(children, { style: dirStyle, dir: dir })}
      </div>
    </div>
  );
}

export default InputRow;
