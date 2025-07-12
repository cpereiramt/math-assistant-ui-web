import { createContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (t) => {    
    localStorage.setItem("token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };
  const redirectToLoginPage = (token) => {
    if (!token) {
      // Redirect to your login page only first time 
      // or when the token is not available
      console.log("No token found, redirecting to login page...");
      window.location.href = "/auth/google";
      localStorage.setItem("token", "invalid_token");
    }
   }
  
  
  return (
    <AuthContext.Provider value={{ token, redirectToLoginPage, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;