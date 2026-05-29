"use client";

import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";

type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

type Props = {
  type?: "text" | "email" | "tel" | "password";
  label: string;
  value: string;
  onChange: (v: string) => void;
  validate?: (v: string) => ValidationResult;
  placeholder?: string;
  required?: boolean;
  /** Whether to show validation state. Defaults to true after first blur. */
  showValidation?: boolean;
  rightAdornment?: React.ReactNode;
  className?: string;
};

/**
 * Input dengan real-time validation feedback.
 * Tampilan checkmark hijau muncul saat valid, error icon merah saat invalid.
 * Validation hanya muncul setelah field di-blur sekali, supaya tidak
 * menampar user langsung saat dia baru ngetik 1 huruf.
 */
export function ValidatedInput({
  type = "text",
  label,
  value,
  onChange,
  validate,
  placeholder,
  required,
  showValidation,
  rightAdornment,
  className,
}: Props) {
  const [touched, setTouched] = useState(false);

  const result = validate?.(value);
  const shouldShow =
    showValidation ?? (touched && value.length > 0 && result !== undefined);
  const isValid = shouldShow && result?.valid;
  const isInvalid = shouldShow && result && !result.valid;

  const stateBorder = isInvalid
    ? "border-error focus:border-error focus:ring-error/20"
    : isValid
      ? "border-success focus:border-success focus:ring-success/20"
      : "border-border focus:border-primary focus:ring-primary/20";

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          required={required}
          className={`w-full h-11 px-4 ${rightAdornment ? "pr-11" : isValid || isInvalid ? "pr-10" : ""} rounded-lg border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-colors ${stateBorder}`}
        />
        {rightAdornment ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightAdornment}
          </div>
        ) : isValid ? (
          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
        ) : isInvalid ? (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-error" />
        ) : null}
      </div>
      {isInvalid && result && !result.valid && (
        <p className="mt-1 text-xs text-error flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {result.message}
        </p>
      )}
    </div>
  );
}

/**
 * Common validators yang reusable — bisa dipakai langsung di ValidatedInput.
 */
export const validators = {
  email: (v: string): ValidationResult => {
    if (!v) return { valid: false, message: "Email wajib diisi" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return { valid: false, message: "Format email tidak valid" };
    return { valid: true };
  },

  phoneId: (v: string): ValidationResult => {
    if (!v) return { valid: true }; // optional
    if (!/^(\+?62|0)[0-9]{8,13}$/.test(v.replace(/\s/g, "")))
      return {
        valid: false,
        message: "Format nomor tidak valid (08xxx atau +62xxx)",
      };
    return { valid: true };
  },

  minLength: (min: number, label = "Field ini") => (v: string): ValidationResult => {
    if (!v) return { valid: false, message: `${label} wajib diisi` };
    if (v.length < min)
      return { valid: false, message: `${label} minimal ${min} karakter` };
    return { valid: true };
  },

  password: (v: string): ValidationResult => {
    if (!v) return { valid: false, message: "Password wajib diisi" };
    if (v.length < 6)
      return { valid: false, message: "Password minimal 6 karakter" };
    return { valid: true };
  },

  matches: (other: string, label = "Password") => (v: string): ValidationResult => {
    if (!v) return { valid: false, message: `Konfirmasi ${label.toLowerCase()} wajib diisi` };
    if (v !== other) return { valid: false, message: `${label} tidak cocok` };
    return { valid: true };
  },
};
