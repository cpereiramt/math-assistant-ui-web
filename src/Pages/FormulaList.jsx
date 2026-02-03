import React from "react";
import {useFormula}  from "../hooks/useFormulas";
import { Link } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import LoginWithGoogle from "./LoginWithGoogle";

export const FormulaList = () => {
    const { formulas } = useFormula();
   
  return (
    formulas.length === 0 || formulas.length  ===  undefined  ? (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center text-gray-800 dark:text-white">
            No Formulas Available
          </h1>
        </div>
      ) : (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center text-gray-800 dark:text-white">
            Equation List
          </h1>
            
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {formulas.map((formula) => (
              <Link key={formula.id} to={`/formula/${formula.id}`} >
                <div
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2
                      className="text-xl font-semibold truncate text-gray-900 dark:text-white"
                      title={formula.name}
                    >
                      {formula.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {formula.group}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${formula.variable ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}>
                        {formula.variable ? 'Variádica' : 'Fixa'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Equation:</p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm text-gray-800 dark:text-gray-200 mb-3">
                    <BlockMath math={formula.equation} />
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Parameters:</p>
                  {!formula.variable ? (
                    <div className="flex flex-wrap gap-2">
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
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded">
                        x1, x2, ..., xn
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Variádica — aceita qualquer número de parâmetros</span>
                    </div>
                  )}

                  <div className="mt-4 text-right">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-all">
                      Use Formula
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
    )
  )
    };