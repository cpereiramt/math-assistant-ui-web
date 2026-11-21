export default function CommunityPagination({ page, totalPages, onChange }) {
  if (totalPages < 2 && page === 0) return null;

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-4 text-sm">
      <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)}
        className="rounded border px-3 py-2 disabled:opacity-40">Previous</button>
      <span>Page {page + 1}</span>
      <button type="button" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}
        className="rounded border px-3 py-2 disabled:opacity-40">Next</button>
    </nav>
  );
}
