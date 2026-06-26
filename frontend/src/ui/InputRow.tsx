interface InputRowData {
  children: React.ReactNode;
  label: string;
  htmlFor?: string;
  customClass?: string;
  customLabelClass?: string;
}

function InputRow({
  children,
  label,
  htmlFor,
  customClass,
  customLabelClass,
}: Readonly<InputRowData>) {
  return (
    <div className={customClass}>
      <label htmlFor={htmlFor} className={`text-stone-800 ${customLabelClass}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default InputRow;
