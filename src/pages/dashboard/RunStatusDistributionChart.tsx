import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { RunSummary } from "../../api/types";

interface RunStatusDistributionChartProps {
  runs: RunSummary[];
}

const STATUS_COLORS: Record<string, string> = {
  queued: "#f59e0b",
  running: "#3b82f6",
  completed: "#22c55e",
  failed: "#ef4444",
};

export function RunStatusDistributionChart({
  runs,
}: RunStatusDistributionChartProps) {
  const counts = runs.reduce(
    (acc, run) => {
      const status = run.status ?? "unknown";
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const statusLabelMap: Record<string, string> = {
    queued: "Queued",
    running: "Running",
    completed: "Completed",
    failed: "Failed",
  };

  const chartData = Object.entries(counts).map(([name, value]) => ({
    name: statusLabelMap[name] ?? name,
    rawName: name,
    value,
  }));

  if (chartData.length === 0) {
    return <div style={{ color: "#64748b" }}>No status data available</div>;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={95}
            innerRadius={50}
            paddingAngle={3}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={STATUS_COLORS[entry.rawName] ?? "#94a3b8"}
              />
            ))}
            
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
