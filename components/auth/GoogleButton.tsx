import React from "react";
import { signIn } from "next-auth/react";

export default function GoogleButton({ text = "Continue with Google" }: { text?: string }) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="w-full h-11 flex items-center justify-center gap-2 px-3 border border-[#d1ccff] rounded-lg bg-white text-[#1a1635] text-sm font-medium cursor-pointer transition-all duration-150 mb-1 hover:bg-[#f8f7ff] hover:border-[#5b4fe8]"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
      {text}
    </button>
  );
}