import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkflowLogin } from "../api/useAuth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const login = useWorkflowLogin();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({
        username: btoa(username),
        password: btoa(password),
      });
      navigate("/", { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data?.error?.detail;
      setError(typeof detail === "string" ? detail : "Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Creator Tools</h1>
          <p className="text-gray-400 mt-1 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-900/40 border border-red-700/60 text-red-300 rounded-lg px-4 py-2.5 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="Enter your username"
              required
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
          >
            {login.isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-xs">
          © {new Date().getFullYear()} Creator Tools
        </p>
      </div>
    </div>
  );
}
