import React from "react";

import { useRouter } from "next/navigation";

export default function AuthLogo() {
  const router = useRouter();


  return (
    <div className="flex justify-center mb-1">
      <div onClick={() => router.push("/")} className="flex items-center gap-0">
        <span className="text-[21px] font-bold text-[#1A1635] tracking-[-0.4px]">Fin</span>
        <span className="text-[21px] font-bold tracking-[-0.4px] text-[#5B4FE8]">Coach</span>
        <span className="text-[21px] font-bold text-[#1A1635] tracking-[-0.4px]">AI</span>
      </div>
    </div>
  );
}