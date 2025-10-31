import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    try {
      const resp = await apiFetch<{ success: boolean; message: string }>("/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMsg(resp.message || "If the email exists, a reset link has been sent");
    } catch (e: any) {
      setErr(e?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-start justify-center pt-24 bg-gray-50 px-4 sm:pt-54">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-center">Forgot Password</h1>
        <p className="text-sm text-gray-600 text-center mt-1">Enter your email and we'll send you a reset link.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 border-gray-300 focus:border-gray-400 focus:ring-gray-100"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className={`w-full rounded-xl px-4 py-2 font-medium text-white ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        {msg && <p className="mt-4 text-center text-green-700">{msg}</p>}
        {err && <p className="mt-4 text-center text-red-700">{err}</p>}
      </div>
    </div>
  );
}
