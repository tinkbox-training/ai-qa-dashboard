import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RunSummary } from "../../api/types";
import { Legend } from 'recharts';

interface RunsPassFailChartProps {
  runs: RunSummary[];
}

export function RunsPassFailChart({ runs }: RunsPassFailChartProps) {
  const chartData = runs
    .slice(0, 10)
    .map((run) => ({
      runId: run.run_id.slice(-6),
      passed: run.execution_summary?.passed ?? 0,
      failed: run.execution_summary?.failed ?? 0,
    }))
    .reverse();

  if (chartData.length === 0) {
    return <div style={{ color: "#64748b" }}>No chart data available</div>;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="runId" />
          <YAxis allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="passed" name="Passed" fill="#22c55e" />
          <Bar dataKey="failed" name="Failed" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
