export default function AuthDivider() {
  return (
    <div className="flex items-center gap-2.5 my-3.5">
      <div className="flex-1 h-px bg-[#eae8fb]"></div>
      <span className="text-xs text-[#8b87a8]">or continue with email</span>
      <div className="flex-1 h-px bg-[#eae8fb]"></div>
    </div>
  );
}