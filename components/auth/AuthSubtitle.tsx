import React from "react";

export default function AuthSubtitle({ text = "Your AI-powered finance companion" }: { text?: string }) {
  return <p className="text-gray-500 text-center text-[12px] mb-8 mt-[-5px]">{text}</p>;
}