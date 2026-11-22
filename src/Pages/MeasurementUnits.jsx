import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchUnits, saveUnit } from "../services/api";
import { calculationMessage, dimensionLabel } from "../utils/calculation";

const empty = { code: "", name: "", reference: "", factor: "", active: true, version: null, dimension: "" };

export default function MeasurementUnits() {
  const { user } = useAuth();
  const admin = user?.role === "ADMIN";
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetchUnits(admin).then((data) => { if (active) setEntries(data); })
      .catch((failure) => { if (active) setError(calculationMessage(failure)); });
    return () => { active = false; };
  }, [admin]);

  function edit(entry) {
    setError("");
    setEditing(Boolean(entry));
    setDraft(entry ? { ...entry.unit, factor: String(entry.unit.factor), active: entry.active, version: entry.version } : empty);
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { code, name, reference, factor, active, version, dimension } = draft;
      const entry = await saveUnit(code, {
        name, reference: reference === "__new_base" ? code : reference, factor, active, version,
        dimension: !editing && reference === "__new_base" ? dimension : null,
      });
      setEntries((previous) => [...previous.filter((item) => item.code !== code), entry]
        .sort((a, b) => a.code.localeCompare(b.code)));
      edit(null);
    } catch (failure) {
      setError(calculationMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  const bases = entries.filter(({ active, unit }) => active && unit.reference === unit.code && unit.dimension !== "CURRENCY");

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Measurement units</h1>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-300">
            <tr><th>Code</th><th>Name</th><th>Dimension</th><th>Reference</th><th>Factor</th>
              {admin && <th>Status</th>}{admin && <th>Manage</th>}</tr>
          </thead>
          <tbody>{entries.map(({ code, unit, active, version }) => (
            <tr key={code} className="border-b border-slate-200">
              <td className="py-3 font-mono">{code}</td><td>{unit.name}</td><td>{dimensionLabel(unit)}</td>
              <td>{unit.reference}</td><td>{unit.factor}</td>
              {admin && <td>{active ? "Active" : "Inactive"}</td>}
              {admin && <td><button type="button" disabled={busy} className="text-blue-700 underline"
                onClick={() => edit({ code, unit, active, version })}>Edit {code}</button></td>}
            </tr>
          ))}</tbody>
        </table>
      </div>
      {admin && <form onSubmit={save} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">{editing ? `Edit ${draft.code}` : "Add unit"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[["code", "Code"], ["name", "Name"], ["factor", "Conversion factor"]].map(([key, label]) => (
            <label key={key} className="block text-sm font-medium">{label}
              <input required value={draft[key]} disabled={key === "code" && editing}
                onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
            </label>
          ))}
          <label className="block text-sm font-medium">Reference unit
            <select required value={draft.reference} disabled={editing}
              onChange={(event) => setDraft((current) => ({ ...current, reference: event.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2">
              <option value="">Select a reference</option>
              {!editing && <option value="__new_base">New physical dimension</option>}
              {bases.map(({ code, unit }) => <option key={code} value={code}>{code} · {unit.name}</option>)}
              {editing && !bases.some(({ code }) => code === draft.reference)
                && <option value={draft.reference}>{draft.reference}</option>}
              {!editing && /^[A-Z]{3}$/.test(draft.code) && !bases.some(({ code }) => code === draft.code)
                && <option value={draft.code}>Currency ({draft.code})</option>}
            </select>
          </label>
          {!editing && draft.reference === "__new_base" && <label className="block text-sm font-medium">Dimension name
            <input required maxLength={40} value={draft.dimension}
              onChange={(event) => setDraft((current) => ({ ...current, dimension: event.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
          </label>}
        </div>
        <p className="text-sm text-slate-600">For centimeters, select m and enter 0.01. For a new base unit or a currency, use factor 1.</p>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active}
          onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} /> Available in new formulas</label>
        <div className="flex gap-3">
          <button disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Save unit</button>
          {editing && <button type="button" disabled={busy} onClick={() => edit(null)} className="px-3 py-2 text-sm">Cancel</button>}
        </div>
      </form>}
    </main>
  );
}
