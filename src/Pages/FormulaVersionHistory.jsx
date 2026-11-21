import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchFormulaVersions } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useFormula } from "../hooks/useFormulas";

function VersionHistory({ id }) {
  const { user } = useAuth();
  const { formulas } = useFormula();
  const [versions, setVersions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchFormulaVersions(id, controller.signal)
      .then(setVersions)
      .catch((failure) => {
        if (controller.signal.aborted) return;
        setError(failure.response?.status === 404
          ? "No published versions were found."
          : "Could not load version history.");
      });
    return () => controller.abort();
  }, [id]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/formulas" className="text-sm font-medium text-blue-700 hover:underline">Explore formulas</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">{versions?.[0]?.name || "Version history"}</h1>
        {versions?.length > 0 && user?.role === "ADMIN" && formulas.some((formula) => formula.id === id) && (
          <Link to={`/admin/formulas/${id}/revision`} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Create revision
          </Link>
        )}
      </div>
      {error ? <p role="alert" className="mt-4 text-red-700">{error}</p> : !versions ? (
        <p role="status" className="mt-4">Loading version history…</p>
      ) : (
        <ol aria-label="Version history" className="mt-6 space-y-4">
          {versions.map((version) => (
            <li key={version.version} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Version {version.version}</h2>
              <p className="mt-1 text-sm text-slate-600">{[version.name, version.group].filter(Boolean).join(" · ")}</p>
              {version.description && <p className="mt-2 text-sm">{version.description}</p>}
              <pre className="mt-3 whitespace-pre-wrap break-words rounded bg-slate-50 p-3 text-sm">{version.equation}</pre>
              <p className="mt-2 text-sm text-slate-600">{version.variable ? "Variadic formula" : version.parameters?.join(", ")}</p>
              <p className="mt-3 text-sm font-medium">
                {version.reviewedAt ? new Date(version.reviewedAt).toLocaleString() : "No review recorded"}
              </p>
              {version.reviewReason && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{version.reviewReason}</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function FormulaVersionHistory() {
  const { id } = useParams();
  return <VersionHistory key={id} id={id} />;
}
