// create the router for the formula list page and the formula card component

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { FormulaList } from "../Pages/FormulaList";
import FormulaCard from "../components/FormulaCard";
import LoginWithGoogle from "../Pages/LoginWithGoogle";

import { NotFound } from "../Pages/NotFound";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import AuthCallback from "../routers/AuthCallBack.jsx";

export const AppRouter = () => {

        
    return (
         <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/auth/google" element={<LoginWithGoogle />} />
        {/* Recomendado: rota para finalizar login e salvar token */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <FormulaList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/formula/:id"
          element={
            <ProtectedRoute>
              <FormulaCard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    );
    }