import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Login from "../Login/Login.jsx";
import Signup from "../Signup/Signup.jsx";

function AuthUI() {
  const [isSignup, setIsSignup] = useState(false);
  const { authError, authLoading, clearError, demoMode, login, signup, user } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [navigate, user]);

  const submit = async (handler, values) => {
    const success = await handler(values);
    if (success) navigate("/");
  };

  const switchMode = () => {
    clearError();
    setIsSignup((value) => !value);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl sm:p-9">
        <Link to="/" className="mb-6 inline-block font-semibold text-indigo-700">
          &larr; Back to tasks
        </Link>
        {demoMode && (
          <div className="mb-5 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950">
            <p className="font-semibold">Demo account (no database required)</p>
            <p className="mt-1">Email: demo@todo.local</p>
            <p>Password: demo1234</p>
            {!isSignup && (
              <button
                type="button"
                disabled={authLoading}
                onClick={() =>
                  submit(login, { email: "demo@todo.local", password: "demo1234" })
                }
                className="mt-3 rounded-md bg-indigo-600 px-3 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {authLoading ? "Signing in..." : "Continue with demo account"}
              </button>
            )}
          </div>
        )}
        {isSignup ? (
          <Signup onSubmit={(values) => submit(signup, values)} loading={authLoading} />
        ) : (
          <Login onSubmit={(values) => submit(login, values)} loading={authLoading} />
        )}
        {authError && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {authError}
          </p>
        )}
        <button
          type="button"
          onClick={switchMode}
          className="mt-5 text-sm font-semibold text-indigo-700 hover:underline"
        >
          {isSignup ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </section>
    </main>
  );
}

export default AuthUI;
