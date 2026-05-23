import React from "react";

interface AuthInputProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
}: AuthInputProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4a4568] mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 border border-[#d1ccff] rounded-lg bg-[#f8f7ff] text-sm text-[#1a1635] placeholder:text-[#c4c1dc] focus:border-[#5b4fe8] focus:bg-white focus:ring-2 focus:ring-[#5b4fe8]/10 outline-none transition"
        required={required}
      />
    </div>
  );
}