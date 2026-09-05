import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const initialsFrom = (name, email) => {
  const value = name?.trim() || email?.trim() || "User";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function UserProfileMenu({ mobile = false }) {
  const {
    user,
    isProfileLoading,
    profileError,
    reloadProfile,
    logout,
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/auth/google", { replace: true });
  };

  const initials = initialsFrom(user?.name, user?.email);

  return (
    <div ref={containerRef} className={mobile ? "relative" : "absolute bottom-6 left-4 right-4"}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`flex items-center rounded-lg border border-slate-200 bg-white text-left transition hover:bg-slate-50 ${
          mobile ? "gap-2 p-1.5" : "w-full gap-3 p-2"
        }`}
      >
        {user?.pictureUrl ? (
          <img
            src={user.pictureUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
            {initials}
          </span>
        )}

        {!mobile && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-slate-900">
              {isProfileLoading ? "Loading profile..." : user?.name || "My profile"}
            </span>
            <span className="block truncate text-xs text-slate-500">
              {user?.email || "Account details"}
            </span>
          </span>
        )}

        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`}
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
        <span className="sr-only">Open user menu</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute z-50 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg ${
            mobile ? "right-0 top-12" : "bottom-full left-0 mb-2"
          }`}
        >
          <div className="border-b border-slate-100 px-4 py-3">
            {profileError ? (
              <div>
                <p className="text-sm font-medium text-slate-900">Profile unavailable</p>
                <button
                  type="button"
                  onClick={reloadProfile}
                  className="mt-1 text-xs font-medium text-blue-700 hover:text-blue-800"
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {isProfileLoading ? "Loading profile..." : user?.name || "User"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
                {user?.plan && (
                  <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {user.plan}
                  </span>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
