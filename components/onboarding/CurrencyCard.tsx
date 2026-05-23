interface CurrencyCardProps {
  code: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function CurrencyCard({ code, name, isSelected, onClick }: CurrencyCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${isSelected ? "#5B4FE8" : "#E2E8F0"}`,
        borderRadius: "8px",
        padding: "8px",
        textAlign: "center",
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
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1A1635" }}>{code}</div>
      <div style={{ fontSize: "10px", color: "#8B87A8", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
    </div>
  );
}