import { Link } from "react-router-dom";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function FormulaCardItem({ formula, rank }) {
  const rating = Number(formula.averageRating || 0);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {rank && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Rank {rank}</p>}
          <h2 className="truncate text-xl font-semibold text-gray-900 dark:text-white" title={formula.name}>
            {formula.name}
          </h2>
        </div>
        <span className={`shrink-0 rounded px-2 py-1 text-xs ${formula.variable ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"}`}>
          {formula.variable ? "Variadic" : "Fixed"}
        </span>
      </div>

      <span className="inline-block w-fit rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
        {formula.group || "General"}
      </span>

      {formula.description && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{formula.description}</p>
      )}

      <div className="mt-4 overflow-x-auto rounded bg-gray-50 p-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        <BlockMath math={formula.displayEquation || formula.equation || ""} />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Parameters:</p>
        {!formula.variable ? (
          <div className="flex flex-wrap gap-2">
            {(formula.parameters || []).map((parameter) => (
              <span key={parameter} className="rounded-md bg-blue-100 px-3 py-1.5 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                {parameter}
              </span>
            ))}
          </div>
        ) : (
          <span className="inline-block rounded-md bg-yellow-100 px-3 py-1.5 text-sm text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            x1, x2, ..., xn
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-gray-100 py-4 dark:border-gray-700">
        <Metric label="Rating" value={`${rating.toFixed(2)} / 1`} />
        <Metric label="Votes" value={formula.ratingCount || 0} />
        <Metric label="Comments" value={formula.commentCount || 0} />
      </div>

      <div className="mt-auto flex justify-end pt-7">
        <Link
          to={`/formula/${formula.id}`}
          className="rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Use Formula
        </Link>
      </div>
    </article>
  );
}