import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useOutletContext } from "react-router-dom";
import { apiRequest } from "./lib/api.js";
import { markAsLoggedInUser, markAsLoggedOutUser } from "./features/auth/authSlice.js";
import { addTodo, removeTodo, setTodos, updateTodo } from "./features/todo/todoSlice.js";
import Header from "./components/Header/Header.jsx";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userData);
  const [ready, setReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const status = await apiRequest("/users/status");
        if (!active) return;
        setDemoMode(status.demoMode);
        if (status.user) {
          dispatch(markAsLoggedInUser(status.user));
          const result = await apiRequest("/todos");
          if (active) dispatch(setTodos(result.todos));
        } else {
          dispatch(markAsLoggedOutUser());
          dispatch(setTodos([]));
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) setReady(true);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, [dispatch]);

  const login = async (credentials) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const result = await apiRequest("/users/login", {
        method: "POST",
        body: credentials,
      });
      const todosResult = await apiRequest("/todos");
      dispatch(markAsLoggedInUser(result.user));
      dispatch(setTodos(todosResult.todos));
      return true;
    } catch (requestError) {
      setAuthError(requestError.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (formData) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const result = await apiRequest("/users/signup", {
        method: "POST",
        body: formData,
      });
      dispatch(markAsLoggedInUser(result.user));
      dispatch(setTodos([]));
      return true;
    } catch (requestError) {
      setAuthError(requestError.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setError("");
    try {
      await apiRequest("/users/logout", { method: "POST" });
      dispatch(markAsLoggedOutUser());
      dispatch(setTodos([]));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const context = {
    user,
    demoMode,
    ready,
    authLoading,
    authError,
    error,
    login,
    signup,
    logout,
    clearError: () => setAuthError(""),
    reportError: (message) => setError(message),
    clearPageError: () => setError(""),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header user={user} onLogout={logout} />
      {error && (
        <div
          role="alert"
          className="mx-auto mt-4 flex max-w-5xl items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            &times;
          </button>
        </div>
      )}
      <Outlet context={context} />
    </div>
  );
}

export function TodoDashboard() {
  const { user, ready, error, reportError, clearPageError } = useOutletContext();
  const todos = useSelector((state) => state.todo.todos);
  const dispatch = useDispatch();
  const [editingTodo, setEditingTodo] = useState(null);
  const [saving, setSaving] = useState(false);

  const saveTodo = async (values) => {
    setSaving(true);
    clearPageError();
    try {
      const result = editingTodo
        ? await apiRequest(`/todos/${editingTodo._id}`, {
            method: "PATCH",
            body: values,
          })
        : await apiRequest("/todos", { method: "POST", body: values });
      if (editingTodo) {
        dispatch(updateTodo(result.todo));
      } else {
        dispatch(addTodo(result.todo));
      }
      setEditingTodo(null);
      return true;
    } catch (requestError) {
      reportError(requestError.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (todo, status) => {
    clearPageError();
    try {
      const result = await apiRequest(`/todos/${todo._id}`, {
        method: "PATCH",
        body: { status },
      });
      dispatch(updateTodo(result.todo));
    } catch (requestError) {
      reportError(requestError.message);
    }
  };

  const deleteTodo = async (todoId) => {
    clearPageError();
    try {
      await apiRequest(`/todos/${todoId}`, { method: "DELETE" });
      dispatch(removeTodo(todoId));
      if (editingTodo?._id === todoId) setEditingTodo(null);
    } catch (requestError) {
      reportError(requestError.message);
    }
  };

  if (!ready) {
    return <main className="mx-auto max-w-5xl px-4 py-16 text-center">Loading your tasks...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Make room for what matters.</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Keep your tasks organized and your next steps clear.
        </p>
        {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
        <Link
          to="/login"
          className="mt-8 inline-flex rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Sign in or create an account
        </Link>
      </main>
    );
  }

  const completedCount = todos.filter((todo) => todo.status === "completed").length;

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section className="h-fit rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <p className="text-sm font-medium text-indigo-600">Your task list</p>
        <h1 className="mt-1 text-2xl font-bold">
          {editingTodo ? "Edit task" : "Add a task"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {completedCount} of {todos.length} tasks completed
        </p>
        <TodoForm
          key={editingTodo?._id || "new"}
          initialTodo={editingTodo}
          onSave={saveTodo}
          onCancel={() => setEditingTodo(null)}
          saving={saving}
        />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your tasks</h2>
            <p className="mt-1 text-sm text-slate-500">Plan it, do it, check it off.</p>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800">
            {todos.length}
          </span>
        </div>
        {todos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No tasks yet. Add your first task to get started.
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo._id} className="rounded-xl bg-white p-5 shadow-sm dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-lg font-semibold ${todo.status === "completed" ? "line-through opacity-60" : ""}`}>
                      {todo.title}
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                      {todo.description}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">
                      Due {todo.dueDate?.slice(0, 10)} at {todo.dueTime} · {todo.priority} priority
                    </p>
                  </div>
                  <select
                    aria-label={`Status for ${todo.title}`}
                    value={todo.status}
                    onChange={(event) => changeStatus(todo, event.target.value)}
                    className="rounded-md border bg-transparent px-2 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="mt-4 flex gap-4 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setEditingTodo(todo)}
                    className="text-indigo-700 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTodo(todo._id)}
                    className="text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function TodoForm({ initialTodo, onSave, onCancel, saving }) {
  const [title, setTitle] = useState(initialTodo?.title || "");
  const [description, setDescription] = useState(initialTodo?.description || "");
  const [priority, setPriority] = useState(initialTodo?.priority || "medium");
  const [dueDate, setDueDate] = useState(
    initialTodo?.dueDate?.slice(0, 10) || getToday(),
  );
  const [dueTime, setDueTime] = useState(initialTodo?.dueTime || "17:00");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({ title, description, priority, dueDate, dueTime });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          required
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          required
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Priority</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" value="low">Low</option>
            <option className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" value="medium">Medium</option>
            <option className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" value="high">High</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            required
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Due time</span>
        <input
          type="time"
          value={dueTime}
          onChange={(event) => setDueTime(event.target.value)}
          className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          required
        />
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : initialTodo ? "Save changes" : "Add task"}
        </button>
        {initialTodo && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 font-semibold"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function getToday() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default App;
