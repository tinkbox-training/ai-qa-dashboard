import { SectionCard } from "../../components/common/SectionCard";
import type { AiFailureExplanation } from "../../api/types";

interface AiExplanationsPanelProps {
  explanations: AiFailureExplanation[];
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
          {explanations.map((item, index) => (
            <div
              key={`${item.title ?? "ai"}-${index}`}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <div><strong>Title:</strong> {item.title ?? "-"}</div>
              <div><strong>Failure Type:</strong> {item.failure_type ?? "-"}</div>
              <div><strong>What Happened:</strong> {item.what_happened ?? "-"}</div>

              {Array.isArray(item.most_likely_causes) && item.most_likely_causes.length > 0 ? (
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
                    {item.evidence_to_check_in_artifacts.map((evidence, evidenceIndex) => (
                      <li key={evidenceIndex}>{evidence}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {Array.isArray(item.specific_fixes) && item.specific_fixes.length > 0 ? (
                <div style={{ marginTop: "8px" }}>
                  <strong>Specific Fixes:</strong>
                  <div style={{ display: "grid", gap: "10px", marginTop: "8px" }}>
                    {item.specific_fixes.map((fix, fixIndex) => (
                      <div
                        key={fixIndex}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "10px",
                        }}
                      >
                        <div><strong>Fix:</strong> {fix.fix ?? "-"}</div>
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
  );
}