import { useState } from "react";
import type { ArtifactFileItem } from "../../api/types";

interface ArtifactFileListProps {
  title: string;
  files: Array<ArtifactFileItem | string>;
}

function normalizeArtifactFile(file: ArtifactFileItem | string) {
  if (typeof file === "string") {
    const parts = file.split(/[/\\]/);
    const name = parts[parts.length - 1] || file;

    return {
      name,
      path: file,
      url: undefined,
    };
  }

  return {
    name: file?.name ?? file?.path ?? "artifact",
    path: file?.path,
    url: file?.url,
  };
}

export function ArtifactFileList({ title, files }: ArtifactFileListProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  async function handleCopy(path?: string) {
    if (!path) return;

    try {
      await navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 1500);
    } catch (error) {
      console.error("Failed to copy path:", error);
    }
  }

  return (
    <div>
      <strong>{title}</strong>
      {files.length > 0 ? (
        <ul style={{ marginTop: "8px" }}>
          {files.map((rawFile, index) => {
            const file = normalizeArtifactFile(rawFile);

            return (
              <li
                key={`${file.path ?? file.name ?? "artifact"}-${index}`}
                style={{ marginBottom: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {file.url ? (
                    file.name?.match(/\.(zip)$/i) ? (
                      <a href={file.url} download>
                        {file.name}
                      </a>
                    ) : (
                      <a href={file.url} target="_blank" rel="noreferrer">
                        {file.name}
                      </a>
                    )
                  ) : (
                    <span>{file.name}</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(file.path)}
                    disabled={!file.path}
                    style={{
                      background: "#fff",
                      color: "#0f172a",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      cursor: file.path ? "pointer" : "not-allowed",
                      fontSize: "12px",
                      opacity: file.path ? 1 : 0.6,
                    }}
                  >
                    {copiedPath === file.path ? "Copied" : "Copy path"}
                  </button>
                </div>

                {file.path ? (
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginTop: "4px",
                      wordBreak: "break-all",
                    }}
                  >
                    {file.path}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div style={{ marginTop: "8px" }}>No {title.toLowerCase()}</div>
      )}
    </div>
  );
}
