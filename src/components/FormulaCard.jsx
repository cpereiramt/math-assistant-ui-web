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
  const { formulas } = useFormula();
  console.log("Formulas:", formulas); 
  const formula = formulas.find((f) => f.id === id);
  if (!formula) {
    return <div>Carregando fórmula...</div>; // ou uma mensagem de erro se apropriado
  }

  const handleChange = (key, value) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleExecute = async (formulaName) => {
    try {
      const res = await executeFormula(formulaName, inputValues, token);
      setResult(res);
    } catch (err) {
      setResult("Erro ao executar fórmula" + err);
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
    <div className="">
      <Link to={`/`} >
      <button className="">← Back</button>
      </Link>  
      <div className="">
      <h2 className="">{formula.name}</h2>
      </div>
      <form onSubmit={(e) => e.preventDefault(e)} className="">

      
        {variables.map((v) => (
          <div key={v} className="">
          <label htmlFor={v} className="">{v}</label>
          <input
            key={v}
            type="number"
            placeholder={v}
            value={inputValues[v] || ""}
            onChange={(e) => handleChange(v, parseFloat(e.target.value))}
            required
            className=""
            />
            </div>
      ))}
          
      <div className="">
        <button
          onClick={() => handleExecute(formula.name)}
          className=""
        >
          Execute
        </button>
        {/* <button
          onClick={() => handleDelete(formula.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
        >
          Deletar
        </button> */}
        {result && (
        <div className="">
          Result: <strong>{result}</strong>
        </div>
      )}
      </div>
          </form>
    </div>
  );
}
