import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config/env";
import { fetchCurrentUserProfile } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(Boolean(token));
  const [profileError, setProfileError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!localStorage.getItem("token")) return;

    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const profile = await fetchCurrentUserProfile();
      setUser(profile);
    } catch (error) {
      setUser(null);
      setProfileError(error);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadProfile();
      return;
    }

    setUser(null);
    setProfileError(null);
    setIsProfileLoading(false);
  }, [token, loadProfile]);

  const login = useCallback((t) => {
    localStorage.setItem("token", t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const redirectToLoginPage = useCallback(() => {
    if (!token) {
      // ideal: redirecionar para o endpoint de login do BACKEND (não do front)
      window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    }
  }, [token]);  

  const value = useMemo(
    () => ({
      token,
      user,
      isProfileLoading,
      profileError,
      login,
      logout,
      reloadProfile: loadProfile,
      redirectToLoginPage,
    }),
    [
      token,
      user,
      isProfileLoading,
      profileError,
      login,
      logout,
      loadProfile,
      redirectToLoginPage,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
