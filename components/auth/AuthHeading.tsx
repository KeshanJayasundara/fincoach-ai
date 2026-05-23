interface AuthHeadingProps {
  title: string;
  subtitle: string;
}

export default function AuthHeading({ title, subtitle }: AuthHeadingProps) {
  return (
    <>
      <h1 className="text-[19px] font-bold text-[#1A1635] tracking-[-0.4px] text-center">
        {title}
      </h1>
      <p className="text-gray-500 text-center text-[13px] mb-8 mt-[-5px]">
        {subtitle}
      </p>
    </>
  );
}