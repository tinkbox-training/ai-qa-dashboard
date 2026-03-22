import { SectionCard } from "../../components/common/SectionCard";
import { stripAnsi } from "../../lib/format";
import type { FailureClusterItem } from "../../api/types";

interface FailureClustersPanelProps {
  clusters: FailureClusterItem[];
}

export function FailureClustersPanel({
  clusters,
}: FailureClustersPanelProps) {
  return (
    <SectionCard title="Failure Clusters">
      {clusters.length === 0 ? (
        <div>No failure clusters</div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {clusters.map((cluster, index) => (
            <div
              key={`${cluster.failure_type ?? "cluster"}-${index}`}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <div><strong>Failure Type:</strong> {cluster.failure_type ?? "-"}</div>
              <div><strong>Count:</strong> {cluster.count ?? 0}</div>

              {Array.isArray(cluster.tests) && cluster.tests.length > 0 ? (
                <div style={{ marginTop: "8px" }}>
                  <strong>Tests:</strong>
                  <ul>
                    {cluster.tests.map((test, testIndex) => (
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
                    {cluster.sample_errors.map((sampleError, errorIndex) => (
                      <li key={errorIndex}>{stripAnsi(sampleError)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}