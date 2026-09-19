import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { User, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { status, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, password, name, role });
      }
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="hero-in mb-8 flex flex-col items-center gap-2 text-center">
          <img src="/favicon.svg" alt="WellNest AI" className="h-32 w-auto" />
          <p className="text-[13.5px] text-slate">Understand. Track. Heal Together.</p>
        </div>

        <div className="hero-in rounded-xl border border-mist bg-white p-6 shadow-panel" style={{ "--d": "150ms" }}>
          <div className="mb-5 flex rounded-lg bg-canvas p-1">
            {[
              { key: "login", label: "Sign in" },
              { key: "register", label: "Create account" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setMode(tab.key);
                  setError("");
                }}
                className={[
                  "flex-1 rounded-md py-2 text-[13.5px] font-semibold transition-colors",
                  mode === tab.key ? "bg-white text-indigo shadow-panel" : "text-slate hover:text-ink",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate">Full name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Johnson"
                  className="w-full rounded-lg border border-mist bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-slate-light focus:border-indigo focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-mist bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-slate-light focus:border-indigo focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate">Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-mist bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-slate-light focus:border-indigo focus:outline-none"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "patient", label: "Patient", icon: User },
                    { key: "caregiver", label: "Caregiver", icon: Users },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRole(key)}
                      className={[
                        "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                        role === key
                          ? "border-indigo bg-indigo-soft text-indigo"
                          : "border-mist bg-white text-slate hover:border-indigo/40",
                      ].join(" ")}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-coral-soft px-3.5 py-2.5 text-[13px] font-medium text-coral">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-indigo-deep disabled:opacity-50"
            >
              {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="hero-in mt-5 text-center text-[12.5px] text-slate-light" style={{ "--d": "300ms" }}>
          Demo login — sarah@wellnest.ai / WellNest123!
        </p>
      </div>
    </div>
  );
}
