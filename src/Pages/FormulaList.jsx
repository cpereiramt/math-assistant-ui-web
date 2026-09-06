import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "katex/dist/katex.min.css";
import { searchFormulas } from "../services/api";
import FormulaCardItem from "../components/FormulaCardItem";

const GROUPS = ["ARITHMETIC", "TRIGONOMETRY", "ALGEBRA", "PERCENTAGE", "GEOMETRY", "FINANCIAL", "PHYSICS", "STATISTICS"];
const SORT_OPTIONS = [
  ["name:ASC", "Name (A–Z)"],
  ["name:DESC", "Name (Z–A)"],
  ["updatedAt:DESC", "Recently updated"],
  ["createdAt:DESC", "Recently created"],
  ["averageRating:DESC", "Highest rated"],
  ["upvotes:DESC", "Most voted"],
  ["commentCount:DESC", "Most commented"],
];

export const FormulaList = () => {
  const [urlParams, setUrlParams] = useSearchParams();
  const [query, setQuery] = useState(urlParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [groups, setGroups] = useState(urlParams.get("groups")?.split(",").filter(Boolean) || []);
  const [type, setType] = useState(urlParams.get("type") || "");
  const [sort, setSort] = useState(urlParams.get("sort") || "name:ASC");
  const [page, setPage] = useState(Number(urlParams.get("page")) || 0);
  const [result, setResult] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, direction] = sort.split(":");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    searchFormulas({ q: debouncedQuery, groups, type, page, sortBy, direction })
      .then((data) => active && setResult(data))
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || "Could not load formulas.");
      })
      .finally(() => active && setLoading(false));

    const nextParams = {};
    if (debouncedQuery) nextParams.q = debouncedQuery;
    if (groups.length) nextParams.groups = groups.join(",");
    if (type) nextParams.type = type;
    if (sort !== "name:ASC") nextParams.sort = sort;
    if (page > 0) nextParams.page = String(page);
    setUrlParams(nextParams, { replace: true });

    return () => { active = false; };
  }, [debouncedQuery, groups, type, page, sort, sortBy, direction, setUrlParams]);

  const toggleGroup = (group) => {
    setGroups((current) => current.includes(group)
      ? current.filter((item) => item !== group)
      : [...current, group]);
    setPage(0);
  };

  const clearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setGroups([]);
    setType("");
    setPage(0);
  };

  const pageLabel = result.totalPages > 0 ? `Page ${page + 1} of ${result.totalPages}` : "";
  const hasFilters = Boolean(query || groups.length || type);

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-white">Explore formulas</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Search by name, description, or equation and refine your results.</p>
      </header>

      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:p-6">
        <label htmlFor="formula-search" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
        <div className="flex gap-2">
          <input
            id="formula-search"
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(0); }}
            placeholder="Example: area, interest, sum..."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {hasFilters && <button type="button" onClick={clearFilters} className="rounded-lg px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-800">Clear filters</button>}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_220px_230px]">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Groups</legend>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  aria-pressed={groups.includes(group)}
                  onClick={() => toggleGroup(group)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${groups.includes(group) ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 text-gray-700 hover:border-blue-400 dark:border-gray-600 dark:text-gray-300"}`}
                >{group}</button>
              ))}
            </div>
          </fieldset>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Equation type
            <select value={type} onChange={(event) => { setType(event.target.value); setPage(0); }} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
              <option value="">All types</option>
              <option value="FIXED">Fixed</option>
              <option value="VARIADIC">Variadic</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by
            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(0); }} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
              {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="mb-4 flex justify-between text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
        <span>{!loading && !error ? `${result.totalElements} formula(s) found` : ""}</span>
        <span>{pageLabel}</span>
      </div>

      {loading && <div className="py-16 text-center text-gray-500">Loading formulas...</div>}
      {!loading && error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div>}
      {!loading && !error && result.content.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">No formulas found</h2>
          <p className="mt-2 text-gray-500">Try removing filters or using a different term.</p>
        </div>
      )}

      {!loading && !error && result.content.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.content.map((formula) => <FormulaCardItem key={formula.id} formula={formula} />)}
        </div>
      )}

      {!loading && !error && result.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
          <button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600">Previous</button>
          <span className="text-sm text-gray-600 dark:text-gray-300">{pageLabel}</span>
          <button type="button" disabled={page + 1 >= result.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600">Next</button>
        </nav>
      )}
    </main>
  );
};
