import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { Proportions } from "lucide-react";

type Props = {
  title: string; // "Create Owner Account" / "Create Shopper Account"
  endpoint: "/auth/register/shopper" | "/auth/register/owner";
  includeUEN?: boolean; // 👈 owners need UEN
  redirectTo?: string; // default: /login
  padClass?: string; // 👈 NEW (optional)
};

type RegisterBody = {
  name: string;
  email: string;
  password: string;
  uen?: string; // owners only
};

const EMAIL_RE = /^(?:[a-zA-Z0-9_'^&+%`{}~|-]+(?:\.[a-zA-Z0-9_'^&+%`{}~|-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const PW_MIN = 8;
const PW_RULES = { upper: /[A-Z]/, lower: /[a-z]/, digit: /\d/ };

export default function RegisterForm({ title, endpoint, includeUEN = false, redirectTo = "/login", padClass = "pt-24 sm:pt-18" }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || redirectTo;

  const [values, setValues] = useState<RegisterBody>({
    name: "",
    email: "",
    password: "",
    uen: "",
  });
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const firstRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => firstRef.current?.focus(), []);

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Name is required";
    if (!values.email) errs.email = "Email is required";
    else if (!EMAIL_RE.test(values.email)) errs.email = "Enter a valid email";
    if (includeUEN) {
      if (!values.uen?.trim()) errs.uen = "UEN is required";
    }
    if (!values.password) errs.password = "Password is required";
    else {
      if (values.password.length < PW_MIN) errs.password = `At least ${PW_MIN} characters`;
      else if (!PW_RULES.upper.test(values.password)) errs.password = "Need at least one uppercase letter";
      else if (!PW_RULES.lower.test(values.password)) errs.password = "Need at least one lowercase letter";
      else if (!PW_RULES.digit.test(values.password)) errs.password = "Need at least one number";
    }
    if (!confirm) errs.confirm = "Confirm your password";
    else if (confirm !== values.password) errs.confirm = "Passwords do not match";
    return errs;
  }, [values, confirm, includeUEN]);

  const canSubmit = useMemo(() => !Object.keys(fieldErrors).length && !loading, [fieldErrors, loading]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    setApiErrors(null);
    const { name, value } = e.target;
    if (name === "confirm") setConfirm(value);
    else setValues((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setApiErrors(null);
    if (!canSubmit) return;

    setLoading(true);
    try {
      const body: any = {
        name: values.name,
        email: values.email,
        password: values.password,
      };
      if (includeUEN) body.businessRegistrationNumber = values.uen;

      const resp = await apiFetch<any>(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp?.success) {
        if (Array.isArray(resp?.errors) && resp.errors.length) {
          setApiErrors(resp.errors);
          setApiError(null);
        } else {
          setApiErrors(null);
          setApiError(resp?.message || "Registration failed");
        }
        return;
      }

      navigate("/verify-email-sent", { state: { email: values.email }, replace: true });
    } catch (err: any) {
      setApiError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (bad?: boolean) =>
    `w-full rounded-xl border px-3 py-2 outline-none focus:ring-4 ${bad ? "border-red-400 focus:ring-red-100" : "border-gray-300 focus:border-gray-400 focus:ring-gray-100"}`;
  return (
    <div className={`min-h-[80vh] flex items-start justify-center bg-gray-50 px-4 ${padClass}`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 sm:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">Fill in the details to continue</p>
        </header>

        {(apiError || (apiErrors && apiErrors.length > 0)) && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-md py-2 px-3 mb-4 text-sm">
            {apiError && <p className="font-medium text-center">{apiError}</p>}
            {apiErrors && (
              <ul className="list-disc list-inside mt-1 text-left space-y-0.5">
                {apiErrors.map((err: string, idx: number) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {apiErrors?.length ? (
          <ul className="mb-4 list-disc pl-5 text-sm text-red-700">
            {apiErrors.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              ref={firstRef}
              id="name"
              name="name"
              type="text"
              className={inputClass(!!fieldErrors.name)}
              placeholder="Jane Doe"
              value={values.name}
              onChange={onChange}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              disabled={loading}
            />
            {fieldErrors.name && (
              <p id="name-error" className="text-xs text-red-600">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className={inputClass(!!fieldErrors.email)}
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

          {includeUEN && (
            <div className="space-y-2">
              <label htmlFor="uen" className="block text-sm font-medium text-gray-700">
                UEN
              </label>
              <input
                id="uen"
                name="uen"
                type="text"
                className={inputClass(!!fieldErrors.uen)}
                placeholder="201912345A"
                value={values.uen}
                onChange={onChange}
                aria-invalid={!!fieldErrors.uen}
                aria-describedby={fieldErrors.uen ? "uen-error" : undefined}
                disabled={loading}
              />
              {fieldErrors.uen && (
                <p id="uen-error" className="text-xs text-red-600">
                  {fieldErrors.uen}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                className={inputClass(!!fieldErrors.password) + " pr-10"}
                placeholder="••••••••"
                value={values.password}
                onChange={onChange}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPw ? (
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
            ) : (
              <p className="text-xs text-gray-500">At least {PW_MIN} chars, include uppercase, lowercase, and a number.</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type={showPw ? "text" : "password"}
              className={inputClass(!!fieldErrors.confirm)}
              placeholder="Repeat your password"
              value={confirm}
              onChange={onChange}
              aria-invalid={!!fieldErrors.confirm}
              aria-describedby={fieldErrors.confirm ? "confirm-error" : undefined}
              disabled={loading}
            />
            {fieldErrors.confirm && (
              <p id="confirm-error" className="text-xs text-red-600">
                {fieldErrors.confirm}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-xl px-4 py-2 font-medium text-white shadow-lg transition ${
              canSubmit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
            }`}
            aria-busy={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
