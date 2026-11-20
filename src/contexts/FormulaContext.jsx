import React, { createContext, useState, useEffect, useCallback } from 'react';

import { fetchFormulas  } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const FormulaContext = createContext();
export const FormulaProvider = ({ children }) => {
    const [formulas, setFormulas] = useState([]);
    const { token } = useAuth();

    const loadFormulas = useCallback(async () => { 
        if (token) {
            fetchFormulas().then(setFormulas).catch(console.error);
        }
        
        
        }, [token]);
    useEffect(() => {
        loadFormulas();
    }, [token, loadFormulas]);

    const updatePublishedFormula = useCallback((formula) => {
        setFormulas((current) => current.some(({ id }) => id === formula.id)
            ? current.map((entry) => entry.id === formula.id ? formula : entry)
            : [...current, formula]);
    }, []);

    return (
        <FormulaContext.Provider value={{ formulas, updatePublishedFormula }}>
            {children}
        </FormulaContext.Provider>
    );
};

export default FormulaContext;