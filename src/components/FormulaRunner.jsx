import { useUnits } from "../hooks/useUnits";
import { calculationLabel, calculationMessage } from "../utils/calculation";
import { useState } from "react";
import { calculateFormula } from "../services/api";
import { CalculationInput } from "./CalculationFields";

export default function FormulaRunner({ formula, mine = false }) {
  const { units, unitsError } = useUnits();
  const [inputs, setInputs] = useState({});
  const [count, setCount] = useState(formula.variable ? Math.min(formula.minParameters ?? 1, 100) : 0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fields = formula.variable
    ? Array.from({ length: count }, (_, index) => `X${index + 1}`)
    : formula.parameters || [];

  async function execute(event) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    setError("");
    const payload = { formulaId: formula.id };
    if (formula.variable) payload.values = fields.map((field) => inputs[field]);
    else payload.variables = Object.fromEntries(fields.map((field) => [field, inputs[field]]));

    try {
      setResult(await calculateFormula(payload, mine));
    } catch (failure) {
      setError(calculationMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={execute} className="mt-4 space-y-4 rounded-xl border border-slate-200 p-4">
      {fields.map((field) => <CalculationInput key={field} field={field}
        expected={formula.unitSnapshots?.[formula.variable ? "ITEM" : field]}
        units={units} input={inputs[field]} onChange={(input) => setInputs((current) => ({ ...current, [field]: input }))} />)}
      {unitsError && formula.unitSnapshots && <p role="alert">{unitsError}</p>}
      {formula.variable && <div className="flex flex-wrap gap-3">
        <button type="button" disabled={count >= Math.min(formula.maxParameters ?? 100, 100)}
          onClick={() => setCount(count + 1)} className="rounded border px-3 py-2 disabled:opacity-50">Add value</button>
        <button type="button" disabled={count <= (formula.minParameters ?? 1)}
          onClick={() => setCount(count - 1)} className="rounded border px-3 py-2 disabled:opacity-50">Remove last value</button>
      </div>}
      <button disabled={busy} className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50">
        Execute
      </button>
      {result && <output className="block break-all font-semibold text-emerald-700">{calculationLabel(result)}</output>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
