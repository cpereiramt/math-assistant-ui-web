import { useEffect, useState } from "react";
import { useFormula } from "../hooks/useFormulas";
import { fetchPendingFormulas, reviewFormula } from "../services/api";

function ReviewCard({ formula, onReviewed, onConflict }) {
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState("");
  const [error, setError] = useState("");

  async function handleReview(event) {
    event.preventDefault();
    const action = event.nativeEvent.submitter?.value;
    if (!reason.trim() || !["approve", "reject"].includes(action) || decision) return;

    setDecision(action);
    setError("");
    try {
      const reviewed = await reviewFormula(formula.id, action, reason.trim());
      onReviewed(reviewed, action);
    } catch (failure) {
      if ([404, 409].includes(failure.response?.status)) {
        onConflict();
      } else {
        setError(failure.response?.status === 403
          ? "Administrator access is required."
          : failure.response?.data?.message || "Could not save the review.");
      }
    } finally {
      setDecision("");
    }
  }

  return (
    <form onSubmit={handleReview} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{formula.name}</h2>
      <p className="mt-1 text-sm text-slate-600">{[formula.group, formula.ownerEmail].filter(Boolean).join(" · ")}</p>
      {formula.description && <p className="mt-3 text-sm text-slate-700">{formula.description}</p>}
      <pre className="mt-4 whitespace-pre-wrap break-words rounded bg-slate-50 p-3 text-sm">{formula.equation}</pre>
      <p className="mt-2 text-sm text-slate-600">{formula.variable ? "Variadic formula" : formula.parameters?.join(", ")}</p>
      <label className="mt-4 block text-sm font-medium text-slate-700">
        Review reason
        <textarea required maxLength={1000} rows={3} value={reason} disabled={Boolean(decision)}
          onChange={(event) => setReason(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" value="approve" disabled={Boolean(decision) || !reason.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {decision === "approve" ? "Approving…" : "Approve"}
        </button>
        <button type="submit" value="reject" disabled={Boolean(decision) || !reason.trim()}
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">
          {decision === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </form>
  );
}

export default function FormulaModeration() {
  const { updatePublishedFormula } = useFormula();
  const [formulas, setFormulas] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchPendingFormulas(controller.signal)
      .then(setFormulas)
      .catch((failure) => {
        if (controller.signal.aborted) return;
        setError(failure.response?.status === 403
          ? "Administrator access is required."
          : "Could not load pending formulas.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refresh]);

  function reload() {
    setLoading(true);
    setError("");
    setRefresh((current) => current + 1);
  }

  function handleReviewed(reviewed, action) {
    if (action === "approve") updatePublishedFormula(reviewed);
    setFormulas((current) => current.filter((formula) => formula.id !== reviewed.id));
    setMessage(action === "approve" ? "Formula approved and published." : "Formula rejected.");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Formula moderation</h1>
        <button type="button" onClick={reload} disabled={loading}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-white disabled:opacity-50">
          Refresh
        </button>
      </div>
      {message && <p role="status" className="mb-4 text-sm text-blue-700">{message}</p>}
      {loading ? <p role="status">Loading pending formulas…</p> : error ? <p role="alert">{error}</p> : (
        formulas.length === 0 ? <p>No formulas are waiting for review.</p> : (
          <div className="grid gap-5 lg:grid-cols-2">
            {formulas.map((formula) => (
              <ReviewCard key={formula.id} formula={formula} onReviewed={handleReviewed} onConflict={() => {
                setMessage("This submission changed while you were reviewing it. The queue has been refreshed.");
                reload();
              }} />
            ))}
          </div>
        )
      )}
    </section>
  );
}
