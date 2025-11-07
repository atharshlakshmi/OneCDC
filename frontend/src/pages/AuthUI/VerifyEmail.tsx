import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "ok" | "fail">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token") || "";
    if (!token) {
      setStatus("fail");
      setMessage("Missing token");
      return;
    }
    (async () => {
      try {
        const r = await apiFetch<{ success: boolean; message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus("ok");
        setMessage(r.message || "Email verified");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } catch (e: any) {
        setStatus("fail");
        setMessage(e?.message || "Invalid or expired token");
      }
    })();
  }, [params, navigate]);

  return (
    <div className="min-h-[calc(100dvh)] grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 sm:p-8 text-center">
        {status === "pending" && <p>Verifying…</p>}
        {status === "ok" && <p className="text-green-700 font-medium">{message} Redirecting to login…</p>}
        {status === "fail" && <p className="text-red-700 font-medium">{message}</p>}
      </div>
    </div>
  );
}
