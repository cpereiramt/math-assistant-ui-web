import { createContext, useCallback, useMemo, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = useCallback((t) => {
    localStorage.setItem("token", t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
  }, []);

  const redirectToLoginPage = useCallback(() => {
    if (!token) {
      // ideal: redirecionar para o endpoint de login do BACKEND (não do front)
      window.location.href = "${API_BASE_URL}/oauth2/authorization/google";
    }
  }, [token]);  

  const value = useMemo(
    () => ({ token, login, logout, redirectToLoginPage }),
    [token, login, logout, redirectToLoginPage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
