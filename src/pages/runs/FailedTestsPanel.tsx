import { SectionCard } from "../../components/common/SectionCard";
import { stripAnsi } from "../../lib/format";
import type { FailedTestDetail } from "../../api/types";

interface FailedTestsPanelProps {
  failedTests: FailedTestDetail[];
}

export function FailedTestsPanel({ failedTests }: FailedTestsPanelProps) {
  return (
    <SectionCard title="Failed Test Details">
      {failedTests.length === 0 ? (
        <div>No failed tests</div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {failedTests.map((test, index) => (
            <div
              key={`${test.title ?? "failed-test"}-${index}`}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <div><strong>Title:</strong> {test.title ?? "-"}</div>
              <div><strong>Suite:</strong> {test.suite ?? "-"}</div>
              <div><strong>Status:</strong> {test.status ?? "-"}</div>
              <div><strong>Duration:</strong> {test.duration_ms ?? 0} ms</div>
              <div><strong>Error:</strong> {stripAnsi(test.error)}</div>
              <div><strong>Stack:</strong> {stripAnsi(test.stack)}</div>

              {Array.isArray(test.attachments) && test.attachments.length > 0 ? (
                <div style={{ marginTop: "8px" }}>
                  <strong>Attachments:</strong>
                  <ul>
                    {test.attachments.map((attachment, attachmentIndex) => (
                      <li key={`${attachment.path ?? "attachment"}-${attachmentIndex}`}>
                        {attachment.name ?? "attachment"} - {attachment.contentType ?? "-"} - {attachment.path ?? "-"}
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
  );
}