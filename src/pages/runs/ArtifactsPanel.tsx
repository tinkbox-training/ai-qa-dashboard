import { SectionCard } from "../../components/common/SectionCard";
import type { ArtifactsPayload } from "../../api/types";

interface ArtifactsPanelProps {
  artifacts?: ArtifactsPayload;
}

export function ArtifactsPanel({ artifacts }: ArtifactsPanelProps) {
  const screenshots = Array.isArray(artifacts?.screenshots)
    ? artifacts.screenshots
    : [];
  const traces = Array.isArray(artifacts?.traces) ? artifacts.traces : [];
  const allFiles = Array.isArray(artifacts?.all_files) ? artifacts.all_files : [];

  return (
    <SectionCard title="Artifacts">
      {screenshots.length === 0 && traces.length === 0 && allFiles.length === 0 ? (
        <div>No artifacts available</div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          <div>
            <strong>Run Directory:</strong> {artifacts?.run_dir ?? "-"}
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
  );
}