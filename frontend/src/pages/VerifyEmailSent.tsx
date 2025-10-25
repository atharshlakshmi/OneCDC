import { useLocation } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function VerifyEmailSent() {
  const location = useLocation();
  const initialEmail = (location.state as any)?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setMsg(null);
    setErr(null);
    setLoading(true);
    try {
      const r = await apiFetch<{ success: boolean; message: string }>("/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMsg(r.message || "Verification email sent");
    } catch (e: any) {
      setErr(e?.message || "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh)] grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 sm:p-8 text-center">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-gray-600 mt-2">We sent a verification link to {initialEmail || "your email"}.</p>

        <div className="mt-6 space-y-3">
          <input type="email" className="w-full rounded-xl border px-3 py-2" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button
            onClick={resend}
            disabled={loading || !email}
            className={`w-full rounded-xl px-4 py-2 text-white ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {loading ? "Sending…" : "Resend verification email"}
          </button>
        </div>

        {msg && <p className="text-green-700 mt-4">{msg}</p>}
        {err && <p className="text-red-700 mt-4">{err}</p>}
      </div>
    </div>
  );
}
