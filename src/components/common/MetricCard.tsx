interface MetricCardProps {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "danger" | "warning";
}

export function MetricCard({ label, value, tone = "default" }: MetricCardProps) {
  const stylesByTone = {
    default: {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      labelColor: "#64748b",
      valueColor: "#0f172a",
    },
    success: {
      background: "#f0fdf4",
      border: "1px solid #86efac",
      labelColor: "#166534",
      valueColor: "#166534",
    },
    danger: {
      background: "#fef2f2",
      border: "1px solid #fca5a5",
      labelColor: "#991b1b",
      valueColor: "#991b1b",
    },
    warning: {
      background: "#fffbeb", // light yellow
      border: "1px solid #fcd34d",
      labelColor: "#92400e",
      valueColor: "#92400e",
    },
  };

  const current = stylesByTone[tone];

  return (
    <div
      style={{
        background: current.background,
        border: current.border,
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div style={{ color: current.labelColor, fontSize: "14px" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "21px",
          fontWeight: 700,
          marginTop: "8px",
          color: current.valueColor,
        }}
      >
        {value}
      </div>
    </div>
  );
}