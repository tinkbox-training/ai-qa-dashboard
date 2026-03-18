import { SectionCard } from "../../components/common/SectionCard";
import type { ArtifactsPayload } from "../../api/types";
import { ArtifactFileList } from "./ArtifactFileList";

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

          <ArtifactFileList title="Screenshots" files={screenshots} />
          <ArtifactFileList title="Traces" files={traces} />
          <ArtifactFileList title="All Files" files={allFiles} />
        </div>
      )}
    </SectionCard>
  );
}