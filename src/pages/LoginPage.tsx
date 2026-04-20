import { useState, FormEvent } from "react";
import { Youtube, Lightbulb, FileText, Type, FileSearch, Eye, EyeOff } from "lucide-react";
import { useWorkflowLogin } from "../api/useAuth";

const features = [
  { icon: Lightbulb, text: "AI video idea generator" },
  { icon: FileText, text: "Full script writer" },
  { icon: Type, text: "Click-optimised title suggestions" },
  { icon: FileSearch, text: "SEO descriptions & tags" },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const login = useWorkflowLogin();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({
        username: btoa(username),
        password: btoa(password),
      });
      window.location.replace("/");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { detail?: string } } } };
      const detail = apiErr?.response?.data?.error?.detail;
      setError(typeof detail === "string" ? detail : "Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-stone-950 p-12 flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Youtube size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">Creator OS</p>
              <p className="text-stone-500 text-xs leading-none mt-0.5">by Creator Tools</p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your AI-powered<br />creator studio
          </h1>
          <p className="text-stone-400 text-[15px] leading-relaxed mb-10 max-w-xs">
            From spark to publish — idea, script, title, SEO and more. Built for serious YouTube creators.
          </p>

          {/* Feature list */}
          <div className="space-y-3.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="w-8 h-8 bg-stone-800 border border-stone-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon size={15} className="text-indigo-400" />
                </div>
                <span className="text-stone-300 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-stone-600 text-xs">
          © {new Date().getFullYear()} Creator Tools · All rights reserved
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center bg-cream-100 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Youtube size={16} className="text-white" />
            </div>
            <span className="font-bold text-stone-900 text-sm">Creator OS</span>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 mb-1">Welcome back</h2>
          <p className="text-stone-500 text-sm mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-stone-700 mb-1.5"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                placeholder="your@email.com"
                required
                className="w-full bg-white border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-stone-700 mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={login.isPending || !username || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm mt-2"
            >
              {login.isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
