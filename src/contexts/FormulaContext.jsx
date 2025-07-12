import React, { createContext, useState, useEffect, useCallback } from 'react';

import { fetchFormulas  } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const FormulaContext = createContext();
export const FormulaProvider = ({ children }) => {
    const [formulas, setFormulas] = useState([]);
    const { token, redirectToLoginPage } = useAuth();

    redirectToLoginPage(token);
    const loadFormulas = useCallback(async () => { 
        if (token) {
            console.log("Loading formulas with token:", token);
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