import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRunDetails } from "../../api/runs";
import { useRunPolling } from "../../hooks/useRunPolling";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { MetricCard } from "../../components/common/MetricCard";
import { SectionCard } from "../../components/common/SectionCard";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { formatDateTime, stripAnsi } from "../../lib/format";
import { RunStatusBanner } from "../../components/run/RunStatusBanner";
import { RunTimeline } from "../../components/run/RunTimeline";

export function RunDetailsPage() {
  const { runId = "" } = useParams();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["runs", runId, "details"],
    queryFn: () => getRunDetails(runId),
    enabled: Boolean(runId),
  });

  const shouldPoll = useMemo(() => {
    return data?.status === "queued" || data?.status === "running";
  }, [data?.status]);

  useRunPolling(runId, shouldPoll);

  if (isLoading) return <LoadingState label="Loading run details..." />;
  if (isError)
    return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  if (!data) return <ErrorState message="Run not found" />;

  const failedTestDetails = Array.isArray(data.failed_test_details)
    ? data.failed_test_details
    : [];
  const aiExplanations = Array.isArray(data.ai_failure_explanations)
    ? data.ai_failure_explanations
    : [];
  const clusters = Array.isArray(data.failure_clusters?.clusters)
    ? data.failure_clusters?.clusters
    : [];
  const screenshots = Array.isArray(data.artifacts?.screenshots)
    ? data.artifacts?.screenshots
    : [];
  const traces = Array.isArray(data.artifacts?.traces)
    ? data.artifacts?.traces
    : [];
  const allFiles = Array.isArray(data.artifacts?.all_files)
    ? data.artifacts?.all_files
    : [];

  return (
    <div>
      <PageHeader
        title={`Run ${data.run_id}`}
        subtitle="Execution details, failures, artifacts, and AI analysis"
        actions={<StatusBadge status={data.status} />}
      />

      <RunStatusBanner
        status={data.status}
        created_at={data.created_at}
        started_at={data.started_at}
        completed_at={data.completed_at}
      />

      <RunTimeline
        status={data.status}
        created_at={data.created_at}
        started_at={data.started_at}
        completed_at={data.completed_at}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <MetricCard
          label="Total"
          value={data.execution_summary?.total ?? data.total_tests ?? 0}
        />
        <MetricCard
          label="Passed"
          value={data.execution_summary?.passed ?? data.passed_tests ?? 0}
        />
        <MetricCard
          label="Failed"
          value={data.execution_summary?.failed ?? data.failed_tests ?? 0}
        />
        <MetricCard
          label="Pass Rate"
          value={`${data.execution_summary?.pass_rate ?? 0}%`}
        />
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        <SectionCard title="Lifecycle">
          <div>
            <strong>Run ID:</strong> {data.run_id}
          </div>
          <div>
            <strong>Status:</strong> {data.status}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {formatDateTime(data.created_at ?? data.timestamp)}
          </div>
          <div>
            <strong>Started:</strong> {formatDateTime(data.started_at)}
          </div>
          <div>
            <strong>Completed:</strong> {formatDateTime(data.completed_at)}
          </div>
          <div>
            <strong>Trigger Source:</strong> {data.trigger_source ?? "-"}
          </div>
          <div>
            <strong>Details Available:</strong>{" "}
            {String(data.details_available ?? false)}
          </div>
        </SectionCard>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <SectionCard title="Requirements">
            {Array.isArray(data.requirements) &&
            data.requirements.length > 0 ? (
              <ul>
                {data.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <div>No requirements</div>
            )}
          </SectionCard>

          <SectionCard title="Executed Files">
            {Array.isArray(data.executed_files) &&
            data.executed_files.length > 0 ? (
              <ul>
                {data.executed_files.map((file) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            ) : (
              <div>No executed files</div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Generated Tests">
          {Array.isArray(data.generated_tests) &&
          data.generated_tests.length > 0 ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {data.generated_tests.map((test, index) => (
                <div
                  key={`${test.file ?? "generated"}-${index}`}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <div>
                    <strong>Requirement:</strong> {test.requirement ?? "-"}
                  </div>
                  <div>
                    <strong>Status:</strong> {test.status ?? "-"}
                  </div>
                  <div>
                    <strong>Flow:</strong> {test.flow ?? "-"}
                  </div>
                  <div>
                    <strong>File:</strong> {test.file ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No generated tests</div>
          )}
        </SectionCard>

        <SectionCard title="Failed Test Details">
          {failedTestDetails.length === 0 ? (
            <div>No failed tests</div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {failedTestDetails.map((test, index) => (
                <div
                  key={`${test.title ?? "failed-test"}-${index}`}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <div>
                    <strong>Title:</strong> {test.title ?? "-"}
                  </div>
                  <div>
                    <strong>Suite:</strong> {test.suite ?? "-"}
                  </div>
                  <div>
                    <strong>Status:</strong> {test.status ?? "-"}
                  </div>
                  <div>
                    <strong>Duration:</strong> {test.duration_ms ?? 0} ms
                  </div>
                  <div>
                    <strong>Error:</strong> {stripAnsi(test.error)}
                  </div>
                  <div>
                    <strong>Stack:</strong> {stripAnsi(test.stack)}
                  </div>

                  {Array.isArray(test.attachments) &&
                  test.attachments.length > 0 ? (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Attachments:</strong>
                      <ul>
                        {test.attachments.map((attachment, attachmentIndex) => (
                          <li
                            key={`${attachment.path ?? "attachment"}-${attachmentIndex}`}
                          >
                            {attachment.name ?? "attachment"} -{" "}
                            {attachment.contentType ?? "-"} -{" "}
                            {attachment.path ?? "-"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="AI Failure Explanations">
          {aiExplanations.length === 0 ? (
            <div>No AI explanations available</div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {aiExplanations.map((item, index) => (
                <div
                  key={`${item.title ?? "ai"}-${index}`}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <div>
                    <strong>Title:</strong> {item.title ?? "-"}
                  </div>
                  <div>
                    <strong>Failure Type:</strong> {item.failure_type ?? "-"}
                  </div>
                  <div>
                    <strong>What Happened:</strong> {item.what_happened ?? "-"}
                  </div>

                  {Array.isArray(item.most_likely_causes) &&
                  item.most_likely_causes.length > 0 ? (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Most Likely Causes:</strong>
                      <ul>
                        {item.most_likely_causes.map((cause, causeIndex) => (
                          <li key={causeIndex}>{cause}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {Array.isArray(item.evidence_to_check_in_artifacts) &&
                  item.evidence_to_check_in_artifacts.length > 0 ? (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Evidence To Check:</strong>
                      <ul>
                        {item.evidence_to_check_in_artifacts.map(
                          (evidence, evidenceIndex) => (
                            <li key={evidenceIndex}>{evidence}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  ) : null}

                  {Array.isArray(item.specific_fixes) &&
                  item.specific_fixes.length > 0 ? (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Specific Fixes:</strong>
                      <div
                        style={{
                          display: "grid",
                          gap: "10px",
                          marginTop: "8px",
                        }}
                      >
                        {item.specific_fixes.map((fix, fixIndex) => (
                          <div
                            key={fixIndex}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "10px",
                            }}
                          >
                            <div>
                              <strong>Fix:</strong> {fix.fix ?? "-"}
                            </div>
                            {Array.isArray(fix.how) && fix.how.length > 0 ? (
                              <ul>
                                {fix.how.map((step, stepIndex) => (
                                  <li key={stepIndex}>{step}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div style={{ marginTop: "8px" }}>
                    <strong>Recommended Next Action:</strong>{" "}
                    {item.recommended_next_action ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

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
                  <div>
                    <strong>Failure Type:</strong> {cluster.failure_type ?? "-"}
                  </div>
                  <div>
                    <strong>Count:</strong> {cluster.count ?? 0}
                  </div>

                  {Array.isArray(cluster.tests) && cluster.tests.length > 0 ? (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Tests:</strong>
                      <ul>
                        {cluster.tests.map((test, testIndex) => (
                          <li
                            key={`${test.title ?? "cluster-test"}-${testIndex}`}
                          >
                            {test.title ?? "-"} | {test.suite ?? "-"} |{" "}
                            {test.status ?? "-"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {Array.isArray(cluster.sample_errors) &&
                  cluster.sample_errors.length > 0 ? (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Sample Errors:</strong>
                      <ul>
                        {cluster.sample_errors.map(
                          (sampleError, errorIndex) => (
                            <li key={errorIndex}>{stripAnsi(sampleError)}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Artifacts">
          {screenshots.length === 0 &&
          traces.length === 0 &&
          allFiles.length === 0 ? (
            <div>No artifacts available</div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <strong>Run Directory:</strong> {data.artifacts?.run_dir ?? "-"}
              </div>

              <div>
                <strong>Screenshots</strong>
                {screenshots.length > 0 ? (
                  <ul>
                    {screenshots.map((file, index) => (
                      <li key={`${file}-${index}`}>{file}</li>
                    ))}
                  </ul>
                ) : (
                  <div>No screenshots</div>
                )}
              </div>

              <div>
                <strong>Traces</strong>
                {traces.length > 0 ? (
                  <ul>
                    {traces.map((file, index) => (
                      <li key={`${file}-${index}`}>{file}</li>
                    ))}
                  </ul>
                ) : (
                  <div>No traces</div>
                )}
              </div>

              <div>
                <strong>All Files</strong>
                {allFiles.length > 0 ? (
                  <ul>
                    {allFiles.map((file, index) => (
                      <li key={`${file}-${index}`}>{file}</li>
                    ))}
                  </ul>
                ) : (
                  <div>No files</div>
                )}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Raw Run JSON">
          <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </SectionCard>
      </div>
    </div>
  );
}
