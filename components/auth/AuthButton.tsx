"use client";

import { Loader2 } from "lucide-react";

interface AuthButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;     // ← මේක එකතු කරන්න
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}

export default function AuthButton({
  children,
  loading = false,
  disabled = false,
  type = "submit",
  onClick,
  className = "",
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`w-full py-3 px-6 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2
        ${loading || disabled 
          ? "bg-[#5B4FE8]/70 cursor-not-allowed" 
          : "bg-[#5B4FE8] hover:bg-[#7B72EC] active:scale-[0.985]"
        }
        ${className}`}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}