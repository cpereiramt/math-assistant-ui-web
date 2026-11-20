import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }) {
  const { token, redirectToLoginPage } = useAuth();
  const { pathname } = useLocation();
  const shouldStartLogin = !token && pathname === "/";
  const loginStarted = useRef(false);

  useEffect(() => {
    if (!shouldStartLogin || loginStarted.current) return;

    loginStarted.current = true;
    redirectToLoginPage();
  }, [shouldStartLogin, redirectToLoginPage]);

  if (shouldStartLogin) return <p role="status">Redirecionando para o login…</p>;
  if (!token) return <Navigate to="/auth/google" replace />;
  return children;
}
