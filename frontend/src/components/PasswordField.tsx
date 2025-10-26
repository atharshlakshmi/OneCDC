import React, { useState } from "react";

interface PasswordFieldProps {
  id: string;
  name: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
}

export default function PasswordField({ id, name, label, value, onChange, placeholder = "••••••••", disabled, error, autoComplete }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border px-3 py-2 pr-10 outline-none focus:ring-4 disabled:opacity-60 ${
            error ? "border-red-400 focus:ring-red-100" : "border-gray-300 focus:border-gray-400 focus:ring-gray-100"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            // eye-off
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l2.16 2.16A11.7 11.7 0 0 0 1.5 12S4.5 19.5 12 19.5c1.85 0 3.5-.38 4.9-1.04l3.31 3.31a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 6c6.2 0 9 6 9 6a18 18 0 0 1-3.08 4.01l-2.1-2.1A3.75 3.75 0 0 0 9.09 9.18l-2.3-2.3C8.78 6.32 10.33 6 12 6Zm-.75 3.22 3.53 3.53A2.25 2.25 0 0 1 11.25 9.22Z" />
            </svg>
          ) : (
            // eye
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M12 5.25c-6.2 0-9 6-9 6s2.8 6 9 6 9-6 9-6-2.8-6-9-6Zm0 9.75a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5Z" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
