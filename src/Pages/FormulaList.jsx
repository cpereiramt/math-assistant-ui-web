import React from "react";
import { useAuth } from "../hooks/useAuth";
import {useFormula}  from "../hooks/useFormulas";


export const FormulaList = () => {
    const { token, login } = useAuth();
    const { formulas } = useFormula();
    console.log("Formulas:", formulas);
    if (!token) {
        const fakeLogin = () => {
        const t = prompt("Cole seu token JWT:");
        if (t) login(t);
        };
        return (
        <div className="h-screen flex items-center justify-center">
            <button
            onClick={fakeLogin}
            className="bg-blue-600 text-white px-6 py-3 rounded text-lg shadow-md"
            >
            Login com Google
            </button>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
        <div className="grid gap-4">
                {formulas.map((formula) => (
                 <h1 key={formula.id}>{formula.name} </h1>
            ))}
            </div>
        </div>
    );
    }