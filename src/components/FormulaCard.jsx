import React, { useState }  from "react";
import { useParams, Link } from 'react-router-dom';
import { useFormula } from "../hooks/useFormulas";
import { useAuth } from "../hooks/useAuth";
import { executeFormula } from "../services/api";



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

  const handleExecute = async (formulaName) => {
    try {
      const res = await executeFormula(formulaName, inputValues, token);
      setResult(res);
    } catch (err) {
      setResult("Error when executing equation " + err);
    }
  };

  //TODO: Insert all this functions on FormulaContext
  /* const handleDelete = async (id) => {
    await deleteFormula(id, token);
    const updated = await fetchFormulas(token);
    setFormulas(updated);
  }; */
  const variables = extractVariables(formula.equation);
   
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
          onClick={() => handleExecute(formula.name)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"        >
          Execute
        </button>
        {/* <button
          onClick={() => handleDelete(formula.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
        >
          Deletar
        </button> */}
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
