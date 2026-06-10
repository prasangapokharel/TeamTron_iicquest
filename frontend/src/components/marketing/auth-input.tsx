"use client";

import { useState } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export function AuthInput({
  type = "text",
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  return (
    <div className="auth-input-wrap">
      <input
        {...props}
        type={inputType}
        className={`input-dark auth-input${isPassword ? " auth-input--password" : ""}${className ? ` ${className}` : ""}`}
      />
      {isPassword && (
        <button
          type="button"
          className="auth-input-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
}

export function AuthSelect({
  id,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="auth-input-wrap auth-input-wrap--select">
      <select
        id={id}
        className={`input-dark auth-input auth-select${className ? ` ${className}` : ""}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
