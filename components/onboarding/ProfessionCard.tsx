interface ProfessionCardProps {
  em: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function ProfessionCard({ em, name, isSelected, onClick }: ProfessionCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${isSelected ? "#5B4FE8" : "#E2E8F0"}`,
        borderRadius: "12px",
        padding: "10px 6px",
        cursor: "pointer",
        transition: "all 0.15s",
        textAlign: "center",
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
      <div style={{ fontSize: "20px", marginBottom: "3px", fontWeight: "normal" }}>{em}</div>
      <div style={{ fontSize: "11px", fontWeight: 600, color: "#4A4568", lineHeight: "1.3" }}>{name}</div>
    </div>
  );
}