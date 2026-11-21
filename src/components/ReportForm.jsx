import { useState } from "react";
import { Link } from "react-router-dom";
import { submitReport } from "../services/community";

export default function ReportForm({ target, id }) {
  const [reason, setReason] = useState("SPAM");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await submitReport(target, id, { reason, details });
      setSent(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not submit the report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="mt-3 text-sm text-slate-700">
      <summary className="w-fit cursor-pointer text-blue-700">Report {target}</summary>
      {sent ? <p role="status" className="mt-2">Report submitted for review.</p> : (
        <form onSubmit={handleSubmit} className="mt-2 grid max-w-lg gap-3 rounded border border-slate-200 bg-white p-3">
          <label className="grid gap-1">
            Reason
            <select value={reason} onChange={(event) => setReason(event.target.value)} className="rounded border border-slate-300 p-2">
              <option value="SPAM">Spam</option>
              <option value="ABUSE">Abuse</option>
              <option value="MATH_ERROR">Mathematical error</option>
            </select>
          </label>
          <label className="grid gap-1">
            {reason === "MATH_ERROR" ? "Explain the error and give a reproducible example" : "Details (optional)"}
            <textarea required={reason === "MATH_ERROR"} maxLength={1000} value={details}
              onChange={(event) => setDetails(event.target.value)} className="rounded border border-slate-300 p-2" />
          </label>
          {message && <p role="alert">{message}</p>}
          <div className="flex flex-wrap items-center gap-4">
            <button disabled={busy} className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50">Submit report</button>
            <Link to="/community-policy" className="text-blue-700 underline">Community policy</Link>
          </div>
        </form>
      )}
    </details>
  );
}
