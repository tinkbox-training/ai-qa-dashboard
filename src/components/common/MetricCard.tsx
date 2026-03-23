import type { ReactNode } from "react";

type Tone = "default" | "success" | "warning" | "danger";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trendLabel?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon?: ReactNode;
  onClick?: () => void;
  tone?: Tone;
}

function getTrendColor(direction?: "up" | "down" | "neutral") {
  if (direction === "up") return "#166534";
  if (direction === "down") return "#b91c1c";
  return "#64748b";
}

function getTrendBackground(direction?: "up" | "down" | "neutral") {
  if (direction === "up") return "#dcfce7";
  if (direction === "down") return "#fee2e2";
  return "#f1f5f9";
}

function getTrendSymbol(direction?: "up" | "down" | "neutral") {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "•";
}

function getToneStyles(tone: Tone) {
  switch (tone) {
    case "success":
      return {
        background: "#f0fdf4",
        border: "1px solid #86efac",
        valueColor: "#166534",
      };
    case "warning":
      return {
        background: "#fffbeb",
        border: "1px solid #fcd34d",
        valueColor: "#92400e",
      };
    case "danger":
      return {
        background: "#fef2f2",
        border: "1px solid #fca5a5",
        valueColor: "#b91c1c",
      };
    case "default":
    default:
      return {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        valueColor: "#0f172a",
      };
  }
}

export function MetricCard({
  label,
  value,
  subtext,
  trendLabel,
  trendDirection = "neutral",
  icon,
  onClick,
  tone = "default",
}: MetricCardProps) {
  const clickable = typeof onClick === "function";
  const toneStyles = getToneStyles(tone);

  const content = (
    <div
      style={{
        background: toneStyles.background,
        border: toneStyles.border,
        borderRadius: 14,
        padding: 16,
        minHeight: 116,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "#64748b",
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>

        {icon ? (
          <div
            style={{
              color: "#94a3b8",
              fontSize: 16,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        ) : null}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: toneStyles.valueColor,
          lineHeight: 1.15,
          letterSpacing: "-0.2px",
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 10,
          minHeight: 34,
          justifyContent: "flex-end",
        }}
      >
        {trendLabel ? (
          <span
            style={{
              width: "fit-content",
              fontSize: 12,
              fontWeight: 600,
              color: getTrendColor(trendDirection),
              background: getTrendBackground(trendDirection),
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            {getTrendSymbol(trendDirection)} {trendLabel}
          </span>
        ) : (
          <div style={{ height: 22 }} />
        )}

        {subtext ? (
          <span
            style={{
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.2,
            }}
          >
            {subtext}
          </span>
        ) : null}
      </div>
    </div>
  );

  if (!clickable) return content;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        textAlign: "left",
        width: "100%",
      }}
      title={`Open ${label.toLowerCase()}`}
    >
      {content}
    </button>
  );
}