"use client";

import { useRef, useEffect } from "react";

interface OTPInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  length?: number;
  disabled?: boolean;
}

export default function OTPInput({
  value,
  onChange,
  length = 6,
  disabled = false,
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, inputValue: string) => {
    if (inputValue.length > 1) return;
    const newValue = [...value];
    newValue[index] = inputValue;
    onChange(newValue);
    if (inputValue && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      const newValue = [...value];
      newValue[index - 1] = "";
      onChange(newValue);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pastedData.length) return;
    const newValue = Array.from({ length }, (_, i) => pastedData[i] || "");
    onChange(newValue);
    const nextFocusIndex = Math.min(pastedData.length - 1, length - 1);
    inputsRef.current[nextFocusIndex]?.focus();
  };

  useEffect(() => {
    if (value.length === 0) {
      onChange(Array(length).fill(""));
    }
  }, [length]);

  return (
    <div className="flex gap-[clamp(6px,2vw,12px)] justify-center w-full">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="
            flex-1 min-w-0 max-w-13
            h-[clamp(44px,14vw,60px)]
            text-center font-semibold font-mono
            text-[clamp(18px,5vw,24px)]
            bg-[#F8F7FF] border-2 border-[#D1CCFF]
            rounded-2xl
            focus:border-[#5B4FE8] focus:bg-white focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all text-[#1A1635]
          "
        />
      ))}
    </div>
  );
}