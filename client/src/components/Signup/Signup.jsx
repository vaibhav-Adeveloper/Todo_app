function Signup({ onSubmit, loading }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
  };

  return (
    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Username</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          placeholder="Choose a username"
          className="w-full rounded-md border bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-md border bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          className="w-full rounded-md border bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Profile image</span>
        <input
          name="profileImage"
          type="file"
          accept="image/*"
          className="w-full text-sm"
          required
        />
        <span className="text-xs text-gray-500">Image file, up to 5 MB</span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}

export default Signup;
