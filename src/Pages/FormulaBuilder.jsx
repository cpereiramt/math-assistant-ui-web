import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createMyFormula,
  fetchMyFormula,
  updateMyFormula,
  validateMyFormula,
} from "../services/api";

const formulaGroups = [
  "ARITHMETIC",
  "TRIGONOMETRY",
  "ALGEBRA",
  "PERCENTAGE",
  "GEOMETRY",
];

const reservedTokens = new Set([
  "ABS",
  "AVG",
  "COS",
  "EXP",
  "LOG",
  "MAX",
  "MIN",
  "POW",
  "SIN",
  "SQRT",
  "SUM",
  "TAN",
]);

function parseParameters(parametersText) {
  return parametersText
    .split(",")
    .map((parameter) => parameter.trim().toUpperCase())
    .filter(Boolean);
}

function detectParameters(equation) {
  const matches = equation.toUpperCase().match(/\b[A-Z][A-Z0-9_]*\b/g) || [];
  return [...new Set(matches)].filter((token) => !reservedTokens.has(token));
}

export default function FormulaBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [name, setName] = useState("");
  const [group, setGroup] = useState("ARITHMETIC");
  const [description, setDescription] = useState("");
  const [equation, setEquation] = useState("");
  const [parametersText, setParametersText] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  const parameters = useMemo(() => parseParameters(parametersText), [parametersText]);

  useEffect(() => {
    if (!isEditing) return;

    const loadFormula = async () => {
      setIsLoading(true);
      try {
        const formula = await fetchMyFormula(id);
        setName(formula.name || "");
        setGroup(formula.group || "ARITHMETIC");
        setDescription(formula.description || "");
        setEquation(formula.equation || "");
        setParametersText((formula.parameters || []).join(", "));
      } catch (error) {
        setMessage(`Error loading formula: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormula();
  }, [id, isEditing]);

  const buildPayload = () => ({
    name,
    group,
    description,
    variable: false,
    equation,
    displayEquation: equation,
    parameters,
  });

  const handleDetectParameters = () => {
    setParametersText(detectParameters(equation).join(", "));
  };

  const handleValidate = async () => {
    try {
      const response = await validateMyFormula(buildPayload());
      setMessage(response.message);
    } catch (error) {
      setMessage(`Validation error: ${error.message}`);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const payload = buildPayload();
      const response = isEditing
        ? await updateMyFormula(id, payload)
        : await createMyFormula(payload);

      setMessage(response);
      navigate("/my-formulas");
    } catch (error) {
      setMessage(`Error saving formula: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-slate-600">Loading formula...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">
            {isEditing ? "Edit custom formula" : "Create custom formula"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Build a private formula with a typed equation and explicit parameters.
          </p>
        </div>
        <Link
          to="/my-formulas"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Back
        </Link>
      </div>

      {message && (
        <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="MY_DISCOUNT"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Group
            <select
              value={group}
              onChange={(event) => setGroup(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {formulaGroups.map((formulaGroup) => (
                <option key={formulaGroup} value={formulaGroup}>
                  {formulaGroup}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Equation
          <textarea
            value={equation}
            onChange={(event) => setEquation(event.target.value)}
            rows={4}
            placeholder="PRICE - (PRICE * DISCOUNT / 100)"
            className="mt-1 w-full font-mono rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </label>

        <div className="mt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm font-medium text-slate-700">
              Parameters
              <input
                type="text"
                value={parametersText}
                onChange={(event) => setParametersText(event.target.value)}
                placeholder="PRICE, DISCOUNT"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </label>
            <button
              type="button"
              onClick={handleDetectParameters}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Detect
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {parameters.map((parameter) => (
              <span
                key={parameter}
                className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
              >
                {parameter}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleValidate}
            className="rounded-md border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Validate
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSaving ? "Saving..." : "Save formula"}
          </button>
        </div>
      </form>
    </div>
  );
}
