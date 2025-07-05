// create the router for the formula list page and the formula card component

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { FormulaList } from "../Pages/FormulaList";
import FormulaCard from "../components/FormulaCard";
import { useAuth } from "../hooks/useAuth";
import { fetchFormulas } from "../services/api";
import { useState, useEffect } from "react";
import { NotFound } from "../Pages/NotFound";

export const AppRouter = () => {
    const { token, login } = useAuth();
    const [formulas, setFormulas] = useState([]);
    
    useEffect(() => {
        if (token) {
        fetchFormulas(token).then(setFormulas).catch(console.error);
        }
    }, [token]);
    
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
        <Router>
        <Routes>
            <Route exact path="/" element={<FormulaList formulas={formulas} />} />
            <Route path="/formula/:id" element={<FormulaCard />} />
            <Route element={<NotFound />} path="*"/>
        </Routes>
        </Router>
    );
    }