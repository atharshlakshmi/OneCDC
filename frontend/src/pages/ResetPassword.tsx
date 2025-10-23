import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = params.get("token") || "";
    setToken(t);
  }, [params]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!token) {
      setErr("Missing reset token");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const resp = await apiFetch<{ success: boolean; message: string }>("/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      setMsg(resp.message || "Password has been reset");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (e: any) {
      setErr(e?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-start justify-center pt-24 bg-gray-50 px-4 sm:pt-54">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-center">Set a new password</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {/* New password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 pr-10 outline-none focus:ring-4 border-gray-300 focus:border-gray-400 focus:ring-gray-100"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.156 2.156A11.74 11.74 0 0 0 1.5 12S4.5 19.5 12 19.5a11.7 11.7 0 0 0 5.164-1.166l3.306 3.306a.75.75 0 0 0 1.06-1.06L3.53 2.47Zm9.012 11.132a2.25 2.25 0 0 1-2.144-2.144l2.144 2.144ZM8.53 7.47l1.63 1.63a3.75 3.75 0 0 0 4.74 4.74l1.284 1.284A10.2 10.2 0 0 1 12 18c-6.2 0-9-6-9-6a18.1 18.1 0 0 1 5.53-4.53Z" />
                    <path d="M15.75 12a3.75 3.75 0 0 0-3.75-3.75c-.407 0-.8.067-1.165.19l4.725 4.725c.123-.364.19-.758.19-1.165Z" />
                    <path d="M12 6c6.2 0 9 6 9 6a18.2 18.2 0 0 1-3.077 4.008l-1.127-1.127A10.7 10.7 0 0 0 21 12s-2.999-7.5-9-7.5c-1.216 0-2.322.26-3.33.69l1.101 1.101A8.7 8.7 0 0 1 12 6Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 5.25c-6.2 0-9 6-9 6s2.8 6 9 6 9-6 9-6-2.8-6-9-6Zm0 9.75a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 pr-10 outline-none focus:ring-4 border-gray-300 focus:border-gray-400 focus:ring-gray-100"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.156 2.156A11.74 11.74 0 0 0 1.5 12S4.5 19.5 12 19.5a11.7 11.7 0 0 0 5.164-1.166l3.306 3.306a.75.75 0 0 0 1.06-1.06L3.53 2.47Zm9.012 11.132a2.25 2.25 0 0 1-2.144-2.144l2.144 2.144ZM8.53 7.47l1.63 1.63a3.75 3.75 0 0 0 4.74 4.74l1.284 1.284A10.2 10.2 0 0 1 12 18c-6.2 0-9-6-9-6a18.1 18.1 0 0 1 5.53-4.53Z" />
                    <path d="M15.75 12a3.75 3.75 0 0 0-3.75-3.75c-.407 0-.8.067-1.165.19l4.725 4.725c.123-.364.19-.758.19-1.165Z" />
                    <path d="M12 6c6.2 0 9 6 9 6a18.2 18.2 0 0 1-3.077 4.008l-1.127-1.127A10.7 10.7 0 0 0 21 12s-2.999-7.5-9-7.5c-1.216 0-2.322.26-3.33.69l1.101 1.101A8.7 8.7 0 0 1 12 6Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 5.25c-6.2 0-9 6-9 6s2.8 6 9 6 9-6 9-6-2.8-6-9-6Zm0 9.75a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className={`w-full rounded-xl px-4 py-2 font-medium text-white ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>

        {msg && <p className="mt-4 text-center text-green-700">{msg}</p>}
        {err && <p className="mt-4 text-center text-red-700">{err}</p>}
      </div>
    </div>
  );
}
