import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import {
  deleteMyFormula,
  executeMyFormula,
  fetchMyFormulas,
} from "../services/api";

function FormulaRunner({ formula }) {
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);

  const handleExecute = async () => {
    const missingParameter = (formula.parameters || []).find(
      (parameter) => inputValues[parameter] === undefined || inputValues[parameter] === "",
    );

    if (missingParameter) {
      setResult(`Fill ${missingParameter} before executing.`);
      return;
    }

    const variables = (formula.parameters || []).reduce((acc, parameter) => {
      acc[parameter] = Number(inputValues[parameter]);
      return acc;
    }, {});

    try {
      const response = await executeMyFormula({
        formulaName: formula.name,
        variables,
      });
      setResult(response);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {(formula.parameters || []).map((parameter) => (
          <label key={parameter} className="text-sm font-medium text-slate-700">
            {parameter}
            <input
              type="number"
              value={inputValues[parameter] || ""}
              onChange={(event) =>
                setInputValues((current) => ({
                  ...current,
                  [parameter]: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleExecute}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Execute
        </button>
        {result !== null && (
          <p className="text-sm font-semibold text-emerald-700">
            Result: {typeof result === "object" ? JSON.stringify(result) : result}
          </p>
        )}
      </div>
    </div>
  );
}

export default function MyFormulaList() {
  const [formulas, setFormulas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadFormulas = async () => {
    setIsLoading(true);
    try {
      const response = await fetchMyFormulas();
      setFormulas(response);
      setMessage("");
    } catch (error) {
      setMessage(`Error loading formulas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFormulas();
  }, []);

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm("Delete this custom formula?");
    if (!shouldDelete) return;

    try {
      const response = await deleteMyFormula(id);
      setMessage(response);
      await loadFormulas();
    } catch (error) {
      setMessage(`Error deleting formula: ${error.message}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">My formulas</h1>
          <p className="mt-2 text-sm text-slate-600">
            Private formulas created in your formula builder.
          </p>
        </div>
        <Link
          to="/my-formulas/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create formula
        </Link>
      </div>

      {message && (
        <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {message}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-600">Loading formulas...</p>
      ) : formulas.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No custom formulas yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create your first private formula and test it locally.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {formulas.map((formula) => (
            <article
              key={formula.id}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{formula.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {formula.group}
                    </span>
                    <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                      Private
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/my-formulas/${formula.id}/edit`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(formula.id)}
                    className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {formula.description && (
                <p className="mt-3 text-sm text-slate-600">{formula.description}</p>
              )}

              <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-800">
                <BlockMath math={formula.displayEquation || formula.equation} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(formula.parameters || []).map((parameter) => (
                  <span
                    key={parameter}
                    className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {parameter}
                  </span>
                ))}
              </div>

              <FormulaRunner formula={formula} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
