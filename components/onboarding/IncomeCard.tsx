interface IncomeCardProps {
  em: string;
  label: string;
  desc: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function IncomeCard({ em, label, desc, isSelected, onClick }: IncomeCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${isSelected ? "#5B4FE8" : "#E2E8F0"}`,
        borderRadius: "12px",
        padding: "14px",
        cursor: "pointer",
        transition: "all 0.15s",
        background: isSelected ? "#EEF0FD" : "#ffffff",
        fontFamily: "'Outfit', sans-serif",
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#818CF8";
          (e.currentTarget as HTMLDivElement).style.background = "#EEF0FD";
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#E2E8F0";
          (e.currentTarget as HTMLDivElement).style.background = "#ffffff";
        }
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "7px" }}>{em}</div>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#1A1635", marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: "11.5px", color: "#8B87A8", lineHeight: "1.5" }}>{desc}</div>
    </div>
  );
}