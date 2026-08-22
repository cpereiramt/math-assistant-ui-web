import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import VisualFormulaBuilder from "../components/VisualFormulaBuilder";
import {
  createMyFormula,
  fetchFormulaBuilderCatalog,
  fetchMyFormula,
  previewBuilderFormula,
  updateMyFormula,
  validateMyFormula,
} from "../services/api";

const formulaGroups = ["ARITHMETIC", "TRIGONOMETRY", "ALGEBRA", "PERCENTAGE", "GEOMETRY", "FINANCIAL", "PHYSICS", "STATISTICS"];
const reservedTokens = new Set(["ABS", "AVG", "COS", "EXP", "LOG", "MAX", "MIN", "POW", "SIN", "SQRT", "SUM", "TAN"]);

function parseParameters(text) {
  return text.split(",").map((value) => value.trim().toUpperCase()).filter(Boolean);
}

function detectParameters(equation) {
  const matches = equation.toUpperCase().match(/\b[A-Z][A-Z0-9_]*\b/g) || [];
  return [...new Set(matches)].filter((token) => !reservedTokens.has(token));
}

function serializeTree(node) {
  if (!node) return null;
  const value = { id: node.id, type: node.type };
  if (node.type === "VARIABLE") value.variableName = node.variableName;
  if (node.type === "CONSTANT") value.constantValue = String(node.constantValue);
  if (node.type === "OPERATOR") {
    value.operator = node.operator;
    value.children = (node.children || []).map(serializeTree);
  }
  if (node.type === "FORMULA") {
    value.sourceFormulaId = node.sourceFormulaId;
    value.bindings = Object.fromEntries(
      Object.entries(node.bindings || {}).map(([parameter, child]) => [parameter, serializeTree(child)]),
    );
  }
  return value;
}

export default function FormulaBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [mode, setMode] = useState("TEXT");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("ARITHMETIC");
  const [description, setDescription] = useState("");
  const [equation, setEquation] = useState("");
  const [parametersText, setParametersText] = useState("");
  const [tree, setTree] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [compiled, setCompiled] = useState(null);
  const [testValues, setTestValues] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const parameters = useMemo(() => parseParameters(parametersText), [parametersText]);

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [available, existing] = await Promise.all([
          fetchFormulaBuilderCatalog(),
          isEditing ? fetchMyFormula(id) : Promise.resolve(null),
        ]);
        setCatalog((available || []).filter((formula) => !formula.variable));
        if (existing) {
          setName(existing.name || "");
          setGroup(existing.group || "ARITHMETIC");
          setDescription(existing.description || "");
          setEquation(existing.equation || "");
          setParametersText((existing.parameters || []).join(", "));
          setMode(existing.inputMode || (existing.expressionTree ? "BUILDER" : "TEXT"));
          setTree(existing.expressionTree || null);
          if (existing.inputMode === "BUILDER") {
            setCompiled({ equation: existing.equation, displayEquation: existing.displayEquation, parameters: existing.parameters || [] });
          }
        }
      } catch (error) {
        showMessage(`Error loading formula builder: ${error.message}`, "error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, isEditing]);

  const buildPayload = () => {
    const common = { name, group, description, variable: false, inputMode: mode };
    return mode === "TEXT"
      ? { ...common, equation, displayEquation: equation, parameters }
      : { ...common, expressionTree: serializeTree(tree) };
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setCompiled(null);
    setTestResult(null);
  };

  const handleValidate = async () => {
    try {
      const response = await validateMyFormula(buildPayload());
      showMessage(response.message, response.valid ? "success" : "error");
      if (response.valid) {
        setCompiled(response);
        setTestValues((current) => (response.parameters || []).reduce(
          (values, parameter) => ({ ...values, [parameter]: current[parameter] ?? "" }), {},
        ));
      } else setCompiled(null);
    } catch (error) {
      showMessage(`Validation error: ${error.message}`, "error");
    }
  };

  const handlePreview = async () => {
    const previewParameters = compiled?.parameters || [];
    const missing = previewParameters.find((parameter) => testValues[parameter] === "" || testValues[parameter] === undefined);
    if (missing) {
      showMessage(`Fill ${missing} before testing.`, "error");
      return;
    }
    try {
      const variables = Object.fromEntries(previewParameters.map((parameter) => [parameter, Number(testValues[parameter])]));
      const response = await previewBuilderFormula(buildPayload(), variables);
      if (!response.valid) {
        showMessage(response.message, "error");
        return;
      }
      setTestResult(response.result);
      showMessage("Formula executed successfully.", "success");
    } catch (error) {
      showMessage(`Preview error: ${error.message}`, "error");
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const response = isEditing ? await updateMyFormula(id, buildPayload()) : await createMyFormula(buildPayload());
      if (typeof response === "string" && (response.startsWith("validation_error") || response.startsWith("not_found"))) {
        showMessage(response, "error");
        return;
      }
      navigate("/my-formulas");
    } catch (error) {
      showMessage(`Error saving formula: ${error.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600">Loading formula builder...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">{isEditing ? "Edit custom formula" : "Create custom formula"}</h1>
          <p className="mt-2 text-sm text-slate-600">Choose a typed equation or assemble a fixed formula visually.</p>
        </div>
        <Link to="/my-formulas" className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100">Back</Link>
      </div>

      {message && (
        <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${messageType === "error" ? "border-red-200 bg-red-50 text-red-800" : messageType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-800"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="MY_FORMULA" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="text-sm font-medium text-slate-700">Group
            <select value={group} onChange={(event) => setGroup(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
              {formulaGroups.map((formulaGroup) => <option key={formulaGroup}>{formulaGroup}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-5 block text-sm font-medium text-slate-700">Description
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </label>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-slate-900">Creation mode</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {[["TEXT", "Typed equation", "Write the equation and declare its parameters."], ["BUILDER", "Visual builder", "Drag fixed formulas and connect their inputs."]].map(([value, title, detail]) => (
              <button key={value} type="button" onClick={() => handleModeChange(value)} className={`rounded-lg border p-4 text-left ${mode === value ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}>
                <span className="block text-sm font-semibold text-slate-900">{title}</span>
                <span className="mt-1 block text-xs text-slate-600">{detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {mode === "TEXT" ? (
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">Equation
              <textarea value={equation} onChange={(event) => setEquation(event.target.value)} rows={4} placeholder="PRICE - (PRICE * DISCOUNT / 100)" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 text-sm font-medium text-slate-700">Parameters
                <input value={parametersText} onChange={(event) => setParametersText(event.target.value)} placeholder="PRICE, DISCOUNT" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </label>
              <button type="button" onClick={() => setParametersText(detectParameters(equation).join(", "))} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Detect</button>
            </div>
          </div>
        ) : (
          <VisualFormulaBuilder catalog={catalog} tree={tree} onTreeChange={(nextTree) => { setTree(nextTree); setCompiled(null); setTestResult(null); }} />
        )}

        {compiled && (
          <section className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
            <h2 className="text-sm font-semibold text-emerald-900">Validated preview</h2>
            <div className="mt-3 overflow-x-auto rounded-md bg-white p-3"><BlockMath math={compiled.displayEquation || compiled.equation} /></div>
            <div className="mt-3 flex flex-wrap gap-2">{(compiled.parameters || []).map((parameter) => <span key={parameter} className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{parameter}</span>)}</div>
            {mode === "BUILDER" && (
              <div className="mt-4">
                <div className="grid gap-3 sm:grid-cols-3">{(compiled.parameters || []).map((parameter) => (
                  <label key={parameter} className="text-sm font-medium text-slate-700">{parameter}
                    <input type="number" step="any" value={testValues[parameter] ?? ""} onChange={(event) => setTestValues((current) => ({ ...current, [parameter]: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
                  </label>
                ))}</div>
                <div className="mt-3 flex items-center gap-4">
                  <button type="button" onClick={handlePreview} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Test values</button>
                  {testResult !== null && <span className="text-sm font-semibold text-emerald-800">Result: {testResult}</span>}
                </div>
              </div>
            )}
          </section>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleValidate} className="rounded-md border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">Validate</button>
          <button type="submit" disabled={isSaving || (mode === "BUILDER" && !tree)} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">{isSaving ? "Saving..." : "Save formula"}</button>
        </div>
      </form>
    </div>
  );
}
