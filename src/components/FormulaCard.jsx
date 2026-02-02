import React, { useState }  from "react";
import { useParams, Link } from 'react-router-dom';
import { useFormula } from "../hooks/useFormulas";
import { useAuth } from "../hooks/useAuth";
import { executeFormula } from "../services/api";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';



const extractVariables = (equation) => {
  const regex = /[a-zA-Z]+/g;
  return [...new Set(equation.match(regex))];
};

export default function FormulaCard() {
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const { token } = useAuth();

  const { id } = useParams();
  const { formulas} = useFormula();
  
  
const formula  = formulas.find((f) => f.id === id);
  if (!formula) {    
    
    return <div>Loading equations...</div>;
  }
  
  const handleChange = (key, value) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleExecute = async () => {
  try {
    let values = [];
    console.log("Executing formula -----------> :", formula);
    console.log("With input values -----------> :", Object.values(inputValues).map(Number));
    let res;
    if (!formula.variable) {
      // fixa: respeita a ordem de parameters
      values = (formula.parameters || []).map((p) => Number(inputValues[p] ?? 0));
      // testar a execução no frontend com formulas fixas
      console.log("Fixed values -----------> :", values);
      res = await executeFormula({ formulaName: formula.name, values }, token);

    } else {
      // variádica: inputValues precisa virar array
      values = Object.values(inputValues).map(Number);
      console.log("Variadic values -----------> :", values);
      res = await executeFormula({ formulaName: formula.name, values }, token);

    }

    setResult(res);
  } catch (err) {
    setResult("Error when executing equation: " + err);
  }
};

  //TODO: Insert all this functions on FormulaContext
  /* const handleDelete = async (id) => {
    await deleteFormula(id, token);
    const updated = await fetchFormulas(token);
    setFormulas(updated);
  }; */
  const variables = formula.variable ? extractVariables(formula.equation) : (formula.parameters || []);
   
  return (
    < div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link to={`/`} >
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
          {formula.variable ? 'Variádica' : 'Fixa'}
        </span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Equation:</p>
      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm text-gray-800 dark:text-gray-200 mb-3">
        <BlockMath math={formula.equation} />
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
          <span className="text-xs text-gray-500 dark:text-gray-400">Variádica — aceita qualquer número de parâmetros</span>
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault(e)}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-4"
      >
        {variables.map((v) => (
          <div key={v}  className="flex flex-col">
            <label htmlFor={v} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {v}:
            </label>
          <input
            key={v}
            type="number"
            placeholder={`Insert a value for ${v}`}
            value={inputValues[v] || ""}
            onChange={(e) => handleChange(v, parseFloat(e.target.value))}
            required
            className="px-4 py-2 border rounded-md text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
            </div>
      ))}
          
        <div className="text-right">
          <button
          onClick={() => handleExecute(formula)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"        >
          Execute
        </button>
        <div className="mt-6 text-center">
        {result !== null && (
          <p className="text-lg font-semibold text-green-600 underline underline-offset-4">
            Result: {result}
          </p>
        )}
        {result == null&& (
          <p className="text-lg font-semibold text-red-600 underline underline-offset-4">
            Erro: {"Error on fetch result"}
          </p>
        )}
      </div>
      </div>
          </form>
    </div>
  );
}
