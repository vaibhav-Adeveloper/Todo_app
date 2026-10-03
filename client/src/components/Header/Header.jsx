import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../../features/toggleMode/toggleSlice.js";

function Header({ user, onLogout }) {
  const isDarkMode = useSelector((state) => state.toggle.isDarkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
    try {
      localStorage.setItem("todo-theme", isDarkMode ? "dark" : "light");
    } catch {
      // The theme still applies when storage is unavailable.
    }
  }, [isDarkMode]);

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
          Todo App
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(toggleDarkMode())}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
          >
            {isDarkMode ? "Light mode" : "Dark mode"}
          </button>
          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
                {user.username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
