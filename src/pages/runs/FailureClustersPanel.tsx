
import { SectionCard } from "../../components/common/SectionCard";
import { stripAnsi } from "../../lib/format";
import type { FailureClusterItem } from "../../api/types";

interface FailureClustersPanelProps {
  clusters: FailureClusterItem[];
  selectedFailureType?: string | null;
  onSelectCluster?: (cluster: FailureClusterItem) => void;
}

export function FailureClustersPanel({ clusters, selectedFailureType, onSelectCluster }: FailureClustersPanelProps) {
  return (
    <SectionCard title="Failure Clusters">
      {clusters.length === 0 ? (
        <div>No failure clusters</div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {clusters.map((cluster, index) => {
            const active = selectedFailureType === cluster.failure_type;
            return (
              <button
                type="button"
                key={`${cluster.failure_type ?? "cluster"}-${index}`}
                onClick={() => onSelectCluster?.(cluster)}
                style={{
                  border: `1px solid ${active ? "#60a5fa" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "left",
                  background: active ? "#eff6ff" : "#fff",
                  cursor: "pointer",
                }}
              >
                <div><strong>Failure Type:</strong> {cluster.failure_type ?? "-"}</div>
                <div><strong>Count:</strong> {cluster.count ?? 0}</div>

                {Array.isArray(cluster.tests) && cluster.tests.length > 0 ? (
                  <div style={{ marginTop: "8px" }}>
                    <strong>Tests:</strong>
                    <ul>
                      {cluster.tests.slice(0, 4).map((test, testIndex) => (
                        <li key={`${test.title ?? "cluster-test"}-${testIndex}`}>
                          {test.title ?? "-"} | {test.suite ?? "-"} | {test.status ?? "-"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {Array.isArray(cluster.sample_errors) && cluster.sample_errors.length > 0 ? (
                  <div style={{ marginTop: "8px" }}>
                    <strong>Sample Errors:</strong>
                    <ul>
                      {cluster.sample_errors.slice(0, 2).map((sampleError, errorIndex) => (
                        <li key={errorIndex}>{stripAnsi(sampleError)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
