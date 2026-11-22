import { useEffect, useState } from "react";
import { fetchFormulaVersions } from "../services/api";

export default function SourceVersionPicker({ node, onChange }) {
  const [versions, setVersions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchFormulaVersions(node.sourceFormulaId, controller.signal)
      .then((history) => setVersions(history.filter((version) => !version.variable)))
      .catch(() => {
        if (!controller.signal.aborted) setError("Could not load source versions.");
      });
    return () => controller.abort();
  }, [node.sourceFormulaId]);

  const applyVersion = (event) => {
    const version = versions.find((entry) => String(entry.version) === event.target.value);
    if (!version) return;
    const existingBindings = Object.entries(node.bindings || {});
    onChange({
      sourceVersion: version.version,
      sourceName: version.name,
      inputUnits: version.inputUnits || {},
      bindings: Object.fromEntries((version.parameters || []).map((parameter) => [
        parameter,
        existingBindings.find(([name]) => name.toUpperCase() === parameter.toUpperCase())?.[1] ?? null,
      ])),
    });
  };

  const currentLabel = node.sourceVersion === 0 ? "Saved legacy snapshot"
    : node.sourceVersion == null ? "Saved reference" : `Version ${node.sourceVersion}`;

  return (
    <div className="mt-3 text-sm text-slate-700">
      <p className="break-words font-medium">{node.sourceName || node.sourceFormulaId}</p>
      <p className="mt-1">{currentLabel}</p>
      {error ? <p role="alert" className="mt-2 text-red-700">{error}</p> : !versions ? (
        <p role="status" className="mt-2">Loading versions…</p>
      ) : (
        <label className="mt-3 block">
          Change source version
          <select value="" onChange={applyVersion}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2">
            <option value="" disabled>Choose a version</option>
            {versions.map((version) => (
              <option key={version.version} value={version.version} disabled={version.version === node.sourceVersion}>
                Version {version.version}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs text-slate-600">Matching inputs keep their bindings.</span>
        </label>
      )}
    </div>
  );
}
