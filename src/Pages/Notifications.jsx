import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommunityPagination from "../components/CommunityPagination";
import { fetchNotifications, readNotification } from "../services/community";

const labels = {
  APPROVED: "Formula approved",
  REJECTED: "Formula rejected",
  COMMENT: "New comment",
  RATING: "New rating",
  CONTENT_REMOVED: "Content removed",
};

export default function Notifications() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const request = new AbortController();
    fetchNotifications(page, request.signal).then(setData).catch(() => {
      if (!request.signal.aborted) setError("Could not load notifications.");
    });
    return () => request.abort();
  }, [page]);

  async function markRead(id) {
    try {
      await readNotification(id);
      setData((current) => ({ ...current, content: current.content.map((entry) =>
        entry.id === id ? { ...entry, readAt: new Date().toISOString() } : entry) }));
    } catch {
      setError("Could not mark the notification as read.");
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Notifications</h1>
      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      {!data && !error && <p className="mt-4">Loading notifications…</p>}
      {data?.totalElements === 0 && <p className="mt-4">No notifications yet.</p>}
      <ul className="mt-4 space-y-3">
        {data?.content.map((entry) => (
          <li key={entry.id} className="rounded border border-slate-200 bg-white p-4">
            <p className="font-semibold">{labels[entry.type]}</p>
            <p>{entry.formulaName}</p>
            {entry.reason && <p className="mt-2 whitespace-pre-wrap">{entry.reason}</p>}
            <time className="mt-2 block text-sm text-slate-600" dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
            <div className="mt-3 flex gap-4 text-sm text-blue-700">
              {["APPROVED", "COMMENT", "RATING"].includes(entry.type) && <Link className="underline" to={`/formula/${entry.formulaId}`}>Open formula</Link>}
              {entry.type === "REJECTED" && <Link className="underline" to="/my-formulas">My formulas</Link>}
              {!entry.readAt && <button type="button" className="underline" onClick={() => markRead(entry.id)}>Mark as read</button>}
            </div>
          </li>
        ))}
      </ul>
      {data && <CommunityPagination page={page} totalPages={data.totalPages} onChange={setPage} />}
    </section>
  );
}
