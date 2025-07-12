// create the router for the formula list page and the formula card component

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { FormulaList } from "../Pages/FormulaList";
import FormulaCard from "../components/FormulaCard";
import LoginWithGoogle from "../Pages/LoginWithGoogle";

import { NotFound } from "../Pages/NotFound";

export const AppRouter = () => {

        
    return (
        <Router>
        <Routes>
            <Route exact path="/" element={<FormulaList />} />
            <Route path="/formula/:id" element={<FormulaCard />} />
            <Route element={<NotFound />} path="*" />
            <Route path="/auth/google" element={<LoginWithGoogle />} />
        </Routes>
        </Router>
    );
    }