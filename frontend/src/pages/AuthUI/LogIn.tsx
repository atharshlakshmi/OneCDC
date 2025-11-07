import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import PasswordField from "../../components/PasswordField";
import { API_BASE } from "../../lib/api";
import { EMAIL_REGEX } from "../../lib/constants";
import type { NavigationState } from "../../lib/types";

interface LoginRequestBody {
  email: string;
  password: string;
}
interface ApiError {
  message?: string;
  errors?: Record<string, string>;
}

function validate(values: LoginRequestBody) {
  const errors: Partial<LoginRequestBody> = {};
  if (!values.email) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(values.email)) errors.email = "Enter a valid email";
  if (!values.password) errors.password = "Password is required";
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as NavigationState | null;
  const from = navState?.from || "/";

  const [values, setValues] = useState<LoginRequestBody>({ email: "", password: "" });
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
        // Redirect based on user role
        if (user.role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else if (user.role === "owner") {
          navigate("/profile/stores", { replace: true });
        } else if (user.role === "registered_shopper") {
          navigate("/shopSearch", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
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

        {apiError && (
          <div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

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
            {fieldErrors.email && (
              <p id="email-error" className="text-xs text-red-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password (shared component) */}
          <PasswordField
            id="password"
            name="password"
            label="Password"
            value={values.password}
            onChange={onChange}
            disabled={loading}
            error={fieldErrors.password}
            autoComplete="current-password"
          />

          {/* Remember me */}
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

            <a href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
              Forgot password?
            </a>
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
