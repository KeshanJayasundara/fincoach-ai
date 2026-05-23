interface AuthProgressProps {
  currentStep: number;
}

export default function AuthProgress({ currentStep }: AuthProgressProps) {
  return (
    <div className="flex items-center justify-between text-xs mb-8">
      <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? "text-[#5B4FE8]" : "text-[#8b87a8]"}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${currentStep >= 1 ? "bg-[#5B4FE8] text-white" : "bg-[#eae8fb]"}`}>1</div>
        <span className="font-semibold">Details</span>
      </div>
      <div className="flex-1 h-px bg-[#eae8fb] mx-3"></div>
      <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? "text-[#5B4FE8]" : "text-[#8b87a8]"}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${currentStep >= 2 ? "bg-[#5B4FE8] text-white" : "bg-[#eae8fb]"}`}>2</div>
        <span className="font-semibold">Verify Email</span>
      </div>
      <div className="flex-1 h-px bg-[#eae8fb] mx-3"></div>
      <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? "text-[#5B4FE8]" : "text-[#8b87a8]"}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${currentStep >= 3 ? "bg-[#5B4FE8] text-white" : "bg-[#eae8fb]"}`}>3</div>
        <span className="font-semibold">Profile</span>
      </div>
    </div>
  );
}