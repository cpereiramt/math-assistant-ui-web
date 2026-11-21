import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchFormulaAuthor, fetchFormulaDetail, recordFormulaView } from "../services/community";
import ReportForm from "./ReportForm";
import { executeFormula } from "../services/api";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import FormulaSocialPanel from "./FormulaSocialPanel";

export default function FormulaCard() {
  const { id } = useParams();
  return <FormulaDetail key={id} id={id} />;
}

function FormulaDetail({ id }) {
  const [inputValues, setInputValues] = useState({});
  const [variadicValues, setVariadicValues] = useState([""]);
  const [result, setResult] = useState(null);

  const [formula, setFormula] = useState(null);
  const [author, setAuthor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const request = new AbortController();
    fetchFormulaDetail(id, request.signal).then(setFormula).catch((failure) => {
      if (!request.signal.aborted) setError(failure.response?.status === 404
        ? "This formula is no longer public." : "Could not load the formula.");
    });
    fetchFormulaAuthor(id, request.signal).then(setAuthor).catch(() => {});
    return () => request.abort();
  }, [id]);

  const formulaId = formula?.id;
  useEffect(() => {
    if (!formulaId) return;
    function recordVisibleView() {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", recordVisibleView);
      recordFormulaView(formulaId).then(() => fetchFormulaDetail(formulaId, request.signal))
        .then(setFormula).catch(() => {});
    }
    const request = new AbortController();
    document.addEventListener("visibilitychange", recordVisibleView);
    recordVisibleView();
    return () => {
      request.abort();
      document.removeEventListener("visibilitychange", recordVisibleView);
    };
  }, [formulaId]);

  if (!formula) return <p className="p-8" role={error ? "alert" : undefined}>{error || "Loading formula…"}</p>;

  const handleChange = (key, value) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleVariadicChange = (index, value) => {
    setVariadicValues((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleAddVariadicValue = () => {
    setVariadicValues((prev) => [...prev, ""]);
  };

  const handleExecute = async () => {
    try {
      let payload;

      if (!formula.variable) {
        const variables = (formula.parameters || []).reduce((acc, parameter) => {
          acc[parameter] = inputValues[parameter];
          return acc;
        }, {});

        payload = {
          formulaName: formula.name,
          variables,
        };
      } else {
        const values = variadicValues
          .map((value) => Number(value))
          .filter((value) => !Number.isNaN(value));

        payload = {
          formulaName: formula.name,
          values,
        };
      }

      const res = await executeFormula(payload);
      setResult(res);
    } catch (err) {
      setResult(`Error when executing equation: ${err}`);
    }
  };

  const variables = formula.parameters || [];

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link to={`/`}>
        <button className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </Link>
      <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Execute: {formula.name}
      </h1>

      <div className="flex justify-center gap-2 mb-4">
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
          {formula.group}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${formula.variable ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}>
          {formula.variable ? 'Variadic' : 'Fixed'}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
        {author && <Link className="text-blue-700 underline" to={`/authors/${author.id}`}>{author.name}</Link>}
        <span>{formula.viewCount || 0} views</span>
      </div>
      {!author?.own && <ReportForm target="formula" id={formula.id} />}

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Equation:</p>
      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xxs text-gray-800 dark:text-gray-200 mb-3">
        <BlockMath math={formula.displayEquation} />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Parameters:</p>
      {!formula.variable ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {(formula.parameters || []).map((param) => (
            <span
              key={param}
              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded"
            >
              {param}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded">
            x1, x2, ..., xn
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Variadic - accepts any number of parameters</span>
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-4"
      >
        {!formula.variable ? (
          variables.map((v) => (
            <div key={v} className="flex flex-col">
              <label htmlFor={v} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {v}:
              </label>
              <input
                id={v}
                type="number"
                placeholder={`Insert a value for ${v}`}
                value={inputValues[v] || ""}
                onChange={(e) => handleChange(v, e.target.value === "" ? "" : Number(e.target.value))}
                required
                className="px-4 py-2 border rounded-md text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))
        ) : (
          <div className="space-y-3">
            {variadicValues.map((value, index) => (
              <div key={`value-${index}`} className="flex flex-col">
                <label htmlFor={`value-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value {index + 1}:
                </label>
                <input
                  id={`value-${index}`}
                  type="number"
                  placeholder={`Insert value ${index + 1}`}
                  value={value}
                  onChange={(e) => handleVariadicChange(index, e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  className="px-4 py-2 border rounded-md text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddVariadicValue}
              className="inline-flex items-center gap-2 border border-blue-300 text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md text-sm transition"
            >
              + Add value
            </button>
          </div>
        )}

        <div className="text-right">
          <button
            type="button"
            onClick={handleExecute}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"
          >
            Execute
          </button>

          <div className="mt-6 text-center">
            {result !== null && (
              <p className="text-lg font-semibold text-green-600 underline underline-offset-4">
                Result: {typeof result === 'object' ? JSON.stringify(result) : result}
              </p>
            )}
          </div>
        </div>
      </form>
      <Link to={`/formula/${formula.id}/versions`} className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">
        Version history
      </Link>
      <FormulaSocialPanel formula={formula} />
    </div>
  );
}
