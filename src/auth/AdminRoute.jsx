import { useAuth } from "../hooks/useAuth";

export default function AdminRoute({ children }) {
  const { user, isProfileLoading, profileError } = useAuth();

  if (isProfileLoading) return <p role="status" className="p-8">Checking access…</p>;
  if (profileError) return <p role="alert" className="p-8">Could not load your profile. Reload to try again.</p>;
  if (user?.role !== "ADMIN") return <p role="alert" className="p-8">Administrator access is required.</p>;
  return children;
}
