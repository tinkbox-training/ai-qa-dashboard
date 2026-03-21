import { SectionCard } from "../../components/common/SectionCard";

type SpecificFix = {
  type?: string;
  change?: string;
  example_patch?: any;
};

type WhatFailed = {
  assertion?: string;
  expected?: string;
  received?: string;
  timeout_ms?: number;
  locator?: string;
  source_location?: string;
};

type AiExplanation = {
  title?: string;
  failure_type?: string;
  why_it_failed?: string;
  what_failed?: WhatFailed | null;
  specific_fixes?: SpecificFix[] | null;
  notes_for_qa?: string;
};

interface AiExplanationsPanelProps {
  explanations: any[];
}

export function AiExplanationsPanel({
  explanations,
}: AiExplanationsPanelProps) {
  return (
    <SectionCard title="AI Failure Explanations">
      {explanations.length === 0 ? (
        <div>No AI explanations available</div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {explanations.map((rawItem, index) => {
            const item = rawItem as AiExplanation;

            return (
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

                <div style={{ marginTop: "8px" }}>
                  <strong>Why It Failed:</strong>{" "}
                  {item.why_it_failed ?? "-"}
                </div>

                {item.what_failed ? (
                  <div style={{ marginTop: "8px" }}>
                    <strong>What Failed:</strong>
                    <div style={{ marginTop: "6px", paddingLeft: "8px" }}>
                      <div>
                        <strong>Assertion:</strong>{" "}
                        {item.what_failed.assertion ?? "-"}
                      </div>
                      <div>
                        <strong>Expected:</strong>{" "}
                        {item.what_failed.expected ?? "-"}
                      </div>
                      <div>
                        <strong>Received:</strong>{" "}
                        {item.what_failed.received ?? "-"}
                      </div>
                      <div>
                        <strong>Timeout:</strong>{" "}
                        {item.what_failed.timeout_ms ?? "-"} ms
                      </div>
                      <div>
                        <strong>Locator:</strong>{" "}
                        {item.what_failed.locator ?? "-"}
                      </div>
                      <div>
                        <strong>Source:</strong>{" "}
                        {item.what_failed.source_location ?? "-"}
                      </div>
                    </div>
                  </div>
                ) : null}

                {Array.isArray(item.specific_fixes) &&
                item.specific_fixes.length > 0 ? (
                  <div style={{ marginTop: "12px" }}>
                    <strong>Specific Fixes:</strong>

                    <div
                      style={{
                        display: "grid",
                        gap: "10px",
                        marginTop: "8px",
                      }}
                    >
                      {item.specific_fixes.map(
                        (fix: SpecificFix, fixIndex: number) => (
                          <div
                            key={fixIndex}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "10px",
                            }}
                          >
                            <div>
                              <strong>Type:</strong> {fix.type ?? "-"}
                            </div>

                            <div>
                              <strong>Change:</strong> {fix.change ?? "-"}
                            </div>

                            {fix.example_patch ? (
                              <div style={{ marginTop: "8px" }}>
                                <strong>Example Patch:</strong>

                                <pre
                                  style={{
                                    whiteSpace: "pre-wrap",
                                    overflowX: "auto",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    padding: "10px",
                                    marginTop: "6px",
                                  }}
                                >
                                  {JSON.stringify(
                                    fix.example_patch,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            ) : null}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : null}

                <div style={{ marginTop: "12px" }}>
                  <strong>Notes for QA:</strong>{" "}
                  {item.notes_for_qa ?? "-"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}