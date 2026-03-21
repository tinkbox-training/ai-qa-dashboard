// To display table and not chart uncomment the below and comment the rest
// import { SectionCard } from "../../components/common/SectionCard";
// import type { DailyTrendPoint } from "../../types/insights";

// interface InsightTrendPanelProps {
//   daily: DailyTrendPoint[];
// }

// function formatShortDate(value: string) {
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return value;
//   return date.toLocaleDateString(undefined, {
//     day: "numeric",
//     month: "short",
//   });
// }

// export function InsightTrendPanel({ daily }: InsightTrendPanelProps) {
//   return (
//     <SectionCard title="Failure Trends">
//       {daily.length === 0 ? (
//         <div style={{ color: "#6b7280" }}>No trend data available.</div>
//       ) : (
//         <div style={{ overflowX: "auto" }}>
//           <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
//             <thead>
//               <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
//                 <th style={{ padding: "10px 8px" }}>Date</th>
//                 <th style={{ padding: "10px 8px" }}>Failures</th>
//                 <th style={{ padding: "10px 8px" }}>Passes</th>
//                 <th style={{ padding: "10px 8px" }}>Unique Failed Tests</th>
//               </tr>
//             </thead>
//             <tbody>
//               {daily.map((item) => (
//                 <tr key={item.date} style={{ borderBottom: "1px solid #f3f4f6" }}>
//                   <td style={{ padding: "10px 8px" }}>{formatShortDate(item.date)}</td>
//                   <td style={{ padding: "10px 8px" }}>{item.failures}</td>
//                   <td style={{ padding: "10px 8px" }}>{item.passes}</td>
//                   <td style={{ padding: "10px 8px" }}>{item.unique_failed_tests}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </SectionCard>
//   );
// }



import { SectionCard } from "../../components/common/SectionCard";
import type { DailyTrendPoint } from "../../types/insights";

interface InsightTrendPanelProps {
  daily: DailyTrendPoint[];
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function InsightTrendPanel({ daily }: InsightTrendPanelProps) {
  const maxValue = Math.max(
    1,
    ...daily.flatMap((item) => [
      item.failures ?? 0,
      item.passes ?? 0,
      item.unique_failed_tests ?? 0,
    ])
  );

  return (
    <SectionCard title="Failure Trends">
      {daily.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No trend data available.</div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {daily.map((item) => (
            <div
              key={item.date}
              style={{
                display: "grid",
                gridTemplateColumns: "84px 1fr",
                gap: 12,
                alignItems: "start",
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", paddingTop: 2 }}>
                {formatShortDate(item.date)}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Failures: {item.failures}</div>
                  <div
                    style={{
                      height: 8,
                      background: "#e5e7eb",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(item.failures / maxValue) * 100}%`,
                        height: "100%",
                        background: "#ef4444",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>Passes: {item.passes}</div>
                  <div
                    style={{
                      height: 8,
                      background: "#e5e7eb",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(item.passes / maxValue) * 100}%`,
                        height: "100%",
                        background: "#22c55e",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    Unique Failed Tests: {item.unique_failed_tests}
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "#e5e7eb",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(item.unique_failed_tests / maxValue) * 100}%`,
                        height: "100%",
                        background: "#f59e0b",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}