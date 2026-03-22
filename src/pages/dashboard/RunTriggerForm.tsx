import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createRun } from "../../api/runs";
import { SectionCard } from "../../components/common/SectionCard";

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/+$/, "");
  return `https://${trimmed.replace(/\/+$/, "")}`;
}

export function RunTriggerForm() {
  const [inputValue, setInputValue] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [selfHealing, setSelfHealing] = useState(false);
  const [generateNegativeVariants, setGenerateNegativeVariants] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createRun,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      navigate(`/runs/${data.run_id}`);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to start run");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const requirements = inputValue
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (requirements.length === 0) {
      setErrorMessage("Please enter at least one requirement.");
      return;
    }

    mutation.mutate({
      requirements,
      base_url: normalizeBaseUrl(baseUrl) || undefined,
      self_healing: selfHealing,
      generate_negative_variants: generateNegativeVariants,
    });
  }

  return (
    <SectionCard title="Start New Run">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
        <div style={{ color: "#64748b", fontSize: "14px" }}>
          Enter one requirement per line. Add a base URL to run the generated Playwright tests against your own environment instead of the built-in sample sites.
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Base URL</span>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://staging.your-app.com"
            style={{
              width: "100%",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "10px 12px",
              font: "inherit",
            }}
          />
          <span style={{ color: "#64748b", fontSize: 12 }}>
            This is passed into Playwright as <code>BASE_URL</code> and is also reused for patch reruns from the same run.
          </span>
        </label>

        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={6}
          placeholder={`User should be able to login with valid credentials
User should see an error message when password is incorrect
Force fail registration test`}
          style={{
            width: "100%",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            padding: "12px",
            font: "inherit",
            resize: "vertical",
          }}
        />

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={selfHealing}
              onChange={(e) => setSelfHealing(e.target.checked)}
            />
            Enable self-healing flag
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={generateNegativeVariants}
              onChange={(e) => setGenerateNegativeVariants(e.target.checked)}
            />
            Generate negative variants
          </label>
        </div>

        {errorMessage ? (
          <div style={{ color: "#b91c1c", fontSize: "14px" }}>{errorMessage}</div>
        ) : null}

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 14px",
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              opacity: mutation.isPending ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {mutation.isPending ? "Starting..." : "Start Run"}
          </button>

          <button
            type="button"
            onClick={() => {
              setInputValue("");
              setBaseUrl("");
              setSelfHealing(false);
              setGenerateNegativeVariants(false);
            }}
            disabled={mutation.isPending}
            style={{
              background: "#fff",
              color: "#0f172a",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "10px 14px",
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
