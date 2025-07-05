import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { FormulaList } from "./Pages/FormulaList";


const App = () => {
  const { token, login } = useAuth();
  const [formulas] = useState([]);
 

 
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
      <h1 className="text-2xl font-bold mb-6">MathExpAssistant</h1>
      <div className="grid gap-4">
      
        <FormulaList>
          {formulas.map((formula) => (
            console.log(formula)
          ))}
        </FormulaList>
      </div>
    </div>
  );
};

export default App;
