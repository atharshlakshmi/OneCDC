import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";

interface LoginRequestBody {
  email: string;
  password: string;
}
interface UserShape {
  _id?: string;
  name?: string;
  email: string;
  role?: string;
}
interface ApiError {
  message?: string;
  errors?: Record<string, string>;
}

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api";
const EMAIL_RE = /^(?:[a-zA-Z0-9_'^&amp;+%`{}~|-]+(?:\.[a-zA-Z0-9_'^&amp;+%`{}~|-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

function validate(values: LoginRequestBody) {
  const errors: Partial<LoginRequestBody> = {};
  if (!values.email) errors.email = "Email is required";
  else if (!EMAIL_RE.test(values.email)) errors.email = "Enter a valid email";
  if (!values.password) errors.password = "Password is required";
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Only accept a relative pathname pushed by ProtectedRoute; default to '/'
  const from = (location.state as any)?.from || "/";

  const [values, setValues] = useState<LoginRequestBody>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginRequestBody>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const canSubmit = useMemo(() => {
    const errs = validate(values);
    return !errs.email && !errs.password && !loading;
  }, [values, loading]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, checked, type } = e.target;
    setApiError(null);
    if (name === "remember" && type === "checkbox") {
      setRemember(checked);
      return;
    }
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const errs = validate(values);
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        let message = "Login failed";
        try {
          const data: ApiError = await res.json();
          if (data?.message) message = data.message;
        } catch {}
        throw new Error(message);
      }

      const resp = await res.json();
      const { user, token } = resp?.data || {};

      if (user && token) {
        login(user, token, remember);
        navigate(from, { replace: true }); // ✅ go back where we came from (or '/')
      } else {
        throw new Error("Invalid login response");
      }
    } catch (err: any) {
      setApiError(err?.message || "Unable to reach server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-start justify-center pt-16 bg-gray-50 px-4 sm:pt-24">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-6 sm:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to continue</p>
        </header>

        {apiError ? (
          <div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              ref={emailInputRef}
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 disabled:opacity-60 ${
                fieldErrors.email ? "border-red-400 focus:ring-red-100" : "border-gray-300 focus:border-gray-400 focus:ring-gray-100"
              }`}
              placeholder="you@example.com"
              value={values.email}
              onChange={onChange}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              disabled={loading}
            />
            {fieldErrors.email ? (
              <p id="email-error" className="text-xs text-red-600">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <a href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`w-full rounded-xl border px-3 py-2 pr-10 outline-none focus:ring-4 disabled:opacity-60 ${
                  fieldErrors.password ? "border-red-400 focus:ring-red-100" : "border-gray-300 focus:border-gray-400 focus:ring-gray-100"
                }`}
                placeholder="••••••••"
                value={values.password}
                onChange={onChange}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
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
            {fieldErrors.password ? (
              <p id="password-error" className="text-xs text-red-600">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          {/* Remember me & submit */}
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={remember}
                onChange={onChange}
                disabled={loading}
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-xl px-4 py-2 font-medium text-white shadow-lg transition ${
              canSubmit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
            }`}
            aria-busy={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Register */}
        <div className="mt-6 text-sm text-gray-600 text-center space-y-1">
          <p>
            New here?{" "}
            <a href="/register/shopper" className="text-indigo-600 hover:underline">
              Register as Shopper
            </a>
          </p>
          <p>
            Business owner?{" "}
            <a href="/register/owner" className="text-indigo-600 hover:underline">
              Register as Owner
            </a>
          </p>
        </div>

        {/* Divider + Google */}
        <div className="my-6">
          <div className="relative flex items-center my-4">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="px-3 text-xs uppercase text-gray-500">or</span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          <div className="flex justify-center">
            <GoogleLoginButton />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
