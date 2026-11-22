import { useId } from "react";
import { dimensionLabel } from "../utils/calculation";

export function UnitSelect({ label, units, value, onChange, unitless = false }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
        {unitless && <option value="">Unitless</option>}
        {units.map((unit) => <option key={unit.code} value={unit.code}>
          {unit.code} · {unit.name} ({dimensionLabel(unit)})
        </option>)}
      </select>
    </div>
  );
}

export function CalculationInput({ field, expected, units, input, onChange }) {
  const options = expected ? [
    expected,
    ...units.filter((unit) => unit.code !== expected.code && unit.reference === expected.reference
      && expected.dimension !== "CURRENCY"),
  ] : [];
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex-1 text-sm font-medium">
        {field}
        <input required type="number" step="any" value={input?.value ?? ""}
          onChange={(event) => onChange({ ...input, value: event.target.value })}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
      </label>
      {expected && <UnitSelect label={`Unit for ${field}`} units={options} value={input?.unit ?? expected.code}
        onChange={(unit) => onChange({ ...input, unit })} />}
    </div>
  );
}
