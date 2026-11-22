import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import FormulaRunner from "../components/FormulaRunner";
import {
  deleteMyFormula,
  fetchMyFormulas,
  publishMyFormula,
} from "../services/api";

const statusLabels = {
  PRIVATE: "Private",
  UNDER_REVIEW: "Under review",
  PUBLIC: "Published",
  REJECTED: "Rejected",
  DEPRECATED: "Deprecated",
};

export default function MyFormulaList() {
  const [formulas, setFormulas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadFormulas = async () => {
    setIsLoading(true);
    try {
      const response = await fetchMyFormulas();
      setFormulas(response);
    } catch (error) {
      setMessage(`Error loading formulas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFormulas();
  }, []);

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm("Delete this custom formula?");
    if (!shouldDelete) return;

    try {
      setBusyId(id);
      const response = await deleteMyFormula(id);
      setMessage(response);
      await loadFormulas();
    } catch (error) {
      setMessage(`Error deleting formula: ${error.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handlePublish = async (id) => {
    setBusyId(id);
    try {
      const response = await publishMyFormula(id);
      setFormulas((current) => current.map((formula) =>
        formula.id === id ? { ...formula, status: response.status ?? "UNDER_REVIEW" } : formula,
      ));
      setMessage("Formula submitted for review.");
    } catch (error) {
      setMessage(error.response?.status === 409
        ? "This formula changed. The list has been refreshed."
        : `Error submitting formula: ${error.message}`);
      if (error.response?.status === 409) await loadFormulas();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">My formulas</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your drafts, review decisions, and published formulas.
          </p>
        </div>
        <Link
          to="/my-formulas/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create formula
        </Link>
      </div>

      {message && (
        <div role="status" className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {message}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-600">Loading formulas...</p>
      ) : formulas.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No custom formulas yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create your first private formula and test it locally.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {formulas.map((formula) => (
            <article
              key={formula.id}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{formula.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {formula.group}
                    </span>
                    <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                      {statusLabels[formula.status] ?? formula.status}
                    </span>
                    <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      {formula.inputMode === "BUILDER" ? "Visual builder" : "Typed equation"}
                    </span>
                  </div>
                </div>
                {formula.status === "PRIVATE" && <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/my-formulas/${formula.id}/edit`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => handleDelete(formula.id)}
                    className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => handlePublish(formula.id)}
                    className="rounded-md border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
                  >
                    Submit for review
                  </button>
                </div>}
                {formula.status === "PUBLIC" && (
                  <Link to={`/formula/${formula.id}/versions`} className="text-sm font-medium text-blue-700 hover:underline">
                    Version history
                  </Link>
                )}
              </div>

              {formula.reviewReason && (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-medium">Review decision</p>
                  <p className="whitespace-pre-wrap break-words">{formula.reviewReason}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {formula.reviewedAt && new Date(formula.reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {formula.description && (
                <p className="mt-3 text-sm text-slate-600">{formula.description}</p>
              )}

              <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-800">
                <BlockMath math={formula.displayEquation || formula.equation} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(formula.parameters || []).map((parameter) => (
                  <span
                    key={parameter}
                    className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {parameter}
                  </span>
                ))}
              </div>

              {["PRIVATE", "PUBLIC"].includes(formula.status) && <FormulaRunner formula={formula} mine={formula.status !== "PUBLIC"} />}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
