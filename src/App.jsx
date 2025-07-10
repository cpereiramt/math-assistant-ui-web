import React, { useState } from "react";
import { FormulaList } from "./Pages/FormulaList";


const App = () => {
  const [formulas] = useState([]);
 
 
  return (
    <>
        <FormulaList>
          {formulas.map((formula) => (
            console.log(formula)
          ))}
        </FormulaList>    
    </>
  );
};

export default App;
