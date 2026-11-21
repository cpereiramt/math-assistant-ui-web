import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommunityPagination from "../components/CommunityPagination";
import { fetchReports, resolveReport } from "../services/community";

const reasons = { SPAM: "Spam", ABUSE: "Abuse", MATH_ERROR: "Mathematical error" };

function ReportItem({ report, onResolved }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    const decision = event.nativeEvent.submitter?.value;
    if (!decision) return;
    setBusy(true);
    setError("");
    try {
      await resolveReport(report.id, decision, reason);
      onResolved();
    } catch (failure) {
      setError(failure.response?.data?.message || "Could not resolve the report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="space-y-3 rounded border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">{reasons[report.reason]} · {report.target === "FORMULA" ? "Formula" : "Comment"}</h2>
      <Link className="text-blue-700 underline" to={`/formula/${report.formulaId}`}>Open formula</Link>
      {report.formulaVersion && <p className="text-sm text-slate-600">Reported version {report.formulaVersion}</p>}
      <blockquote className="whitespace-pre-wrap break-words border-l-2 border-slate-300 pl-3">{report.evidence}</blockquote>
      {report.details && <p className="whitespace-pre-wrap break-words">{report.details}</p>}
      <form onSubmit={submit} className="grid max-w-lg gap-3">
        <label className="grid gap-1">Decision reason
          <textarea required maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)}
            className="rounded border border-slate-300 p-2" />
        </label>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button disabled={busy || !reason.trim()} value="DISMISSED" className="rounded border px-3 py-2 disabled:opacity-40">Dismiss report</button>
          <button disabled={busy || !reason.trim()} value="REMOVED" className="rounded bg-red-700 px-3 py-2 text-white disabled:opacity-40">Remove content</button>
        </div>
      </form>
    </li>
  );
}

export default function CommunityReports() {
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const request = new AbortController();
    fetchReports(page, request.signal).then((result) => {
      if (page > 0 && !result.content.length) setPage(page - 1);
      else setData(result);
    }).catch(() => {
      if (!request.signal.aborted) setError("Could not load reports.");
    });
    return () => request.abort();
  }, [page, revision]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Content reports</h1>
      <Link className="mt-3 inline-block text-blue-700 underline" to="/admin/formulas">Publication review</Link>
      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      {!data && !error && <p className="mt-4">Loading reports…</p>}
      {data?.totalElements === 0 && <p className="mt-4">No open reports.</p>}
      <ul className="mt-4 space-y-4">
        {data?.content.map((report) => <ReportItem key={report.id} report={report} onResolved={() =>
          setRevision((current) => current + 1)} />)}
      </ul>
      {data && <CommunityPagination page={page} totalPages={data.totalPages} onChange={setPage} />}
    </section>
  );
}
