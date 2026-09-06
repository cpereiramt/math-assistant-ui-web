import { useEffect, useState } from "react";
import FormulaCardItem from "../components/FormulaCardItem";
import { fetchMostRatedFormulas } from "../services/api";

export default function MostRatedFormulas() {
  const [result, setResult] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchMostRatedFormulas({ page, size: 12 })
      .then((data) => active && setResult(data))
      .catch((requestError) => {
        if (active) {
          setError(requestError?.response?.data?.message || "Could not load the public formulas.");
        }
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [page]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Community picks</p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Most rated formulas</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Start with the public formulas the community has found most useful.
            </p>
          </div>
          {!loading && !error && <p className="text-sm text-slate-500">{result.totalElements} public formulas</p>}
        </div>
      </header>

      {loading && <div className="py-20 text-center text-sm text-slate-500">Loading community picks...</div>}
      {!loading && error && (
        <div role="alert" className="mt-8 border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && result.content.length === 0 && (
        <div className="mt-8 border border-dashed border-slate-300 p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No rated formulas yet</h2>
          <p className="mt-2 text-sm text-slate-600">Be the first to rate a public formula.</p>
        </div>
      )}
      {!loading && !error && result.content.length > 0 && (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {result.content.map((formula, index) => (
            <FormulaCardItem key={formula.id} formula={formula} rank={page * 12 + index + 1} />
          ))}
        </div>
      )}

      {!loading && !error && result.totalPages > 1 && (
        <nav aria-label="Formula ranking pagination" className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
            className="border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page + 1} of {result.totalPages}</span>
          <button
            type="button"
            disabled={page + 1 >= result.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}