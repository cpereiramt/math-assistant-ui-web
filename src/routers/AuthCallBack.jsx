import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      login(token);

      // remove token da URL (boa prática)
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());

      navigate("/"); // ou dashboard
    } else {
      navigate("/auth/google");
    }
  }, [login, navigate]);

  return null;
}
