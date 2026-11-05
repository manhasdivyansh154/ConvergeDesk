import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const variantClass = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-danger",
  }[variant] || "btn-primary";

  const sizeClass = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  }[size] || "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : Icon && iconPosition === "left" ? (
        <Icon className="w-4 h-4" aria-hidden="true" />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === "right" && (
        <Icon className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}

