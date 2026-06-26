"use client";

import { useState } from "react";

type FileInputProps = {
  label: string;
  inputName: string;
  onFileSelect: (file: File) => void;
  isFileUploaded: boolean;
};

export default function FileInput({
  label,
  inputName,
  onFileSelect,
  isFileUploaded,
}: FileInputProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selectedFile = e.target.files[0];
    onFileSelect(selectedFile);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="lg:col-span-2 xl:col-span-1">
      <label className="font-medium text-stone-700">{label}</label>
      <div className="flex gap-3">
        <div className="flex grow">
          <input
            type="file"
            id={inputName}
            name={inputName}
            onChange={handleSelect}
            className="hidden"
            accept="image/png"
          />

          <label
            htmlFor={inputName}
            className={`
                    h-15 cursor-pointer flex grow items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 text-stone-500
                    hover:border-primary hover:text-primary transition-colors duration-200
                    ${isFileUploaded === false ? "bg-white" : "bg-green-50 border-green-400 text-green-600"}
                  `}
          >
            {isFileUploaded === false && "انتخاب فایل"}
            {isFileUploaded === true && "✅ آپلود انجام شد"}
          </label>
        </div>

        {preview && (
          <div className="flex items-center gap-4">
            <div className="size-15 rounded-full overflow-hidden border border-stone-300 shadow-sm">
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
