import React, { createContext, useState, useEffect, useCallback } from 'react';

const FormulaContext = createContext();
import { fetchFormulas  } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export const FormulaProvider = ({ children }) => {
    const [formulas, setFormulas] = useState([]);
    const { token } = useAuth();
    const loadFormulas = useCallback(async () => { 
        if (token) {
            fetchFormulas(token).then(setFormulas).catch(console.error);
        }
    }, [token]);
    useEffect(() => {
        loadFormulas();
    }, [token, loadFormulas]);

    return (
        <FormulaContext.Provider value={{ formulas }}>
            {children}
        </FormulaContext.Provider>
    );
};

export default FormulaContext;