import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/", label: "General formulas" },
  { to: "/my-formulas", label: "My formulas" },
  { to: "/my-formulas/new", label: "Create formula" },
];

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/google", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-6 md:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Math Assistant
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950">
            Formula Builder
          </h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "block rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="absolute bottom-6 left-4 right-4 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </aside>

      <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-950">Formula Builder</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            Logout
          </button>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="md:pl-64">
        <Outlet />
      </main>
    </div>
  );
}
