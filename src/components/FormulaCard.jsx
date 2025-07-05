import React, { useContext } from "react";
import { useParams } from 'react-router-dom';
import {useFormula}  from "../hooks/useFormulas";
const extractVariables = (equation) => {
  const regex = /[a-zA-Z]+/g;
  return [...new Set(equation.match(regex))];
};

export default function FormulaCard({ inputValues, onChange, onExecute, onDelete }) {
  const { id } = useParams();
  const { formulas } = useContext(useFormula);
  console.log("FormulaCard id:", id);
  console.log("Formula list:", formulas);
  const formula = formulas.find(f => f.id === id);
  console.log("FormulaCard id:", formula);
  const variables = extractVariables(formula.equation);

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="mb-2">
        <h2 className="font-bold text-xl">{formula.name}</h2>
        <p className="text-gray-600">{formula.equation}</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {variables.map((v) => (
          <input
            key={v}
            type="number"
            placeholder={v}
            value={inputValues[v] || ""}
            onChange={(e) => onChange(v, parseFloat(e.target.value))}
            className="border px-2 py-1 rounded w-24"
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onExecute(formula.name)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
        >
          Executar
        </button>
        <button
          onClick={() => onDelete(formula.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
        >
          Deletar
        </button>
      </div>
    </div>
  );
}
