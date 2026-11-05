import React from "react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}) {
  return (
    <div
      className={`surface-card ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        background: "var(--bg-surface)",
        minHeight: "240px",
      }}
    >
      {Icon && (
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-surface-subtle)",
            color: "var(--text-muted)",
            display: "grid",
            placeItems: "center",
            marginBottom: "16px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}

      <h3
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "6px",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            maxWidth: "420px",
            marginBottom: actionLabel ? "20px" : "0",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {actionLabel && onAction && (
            <Button variant="primary" icon={actionIcon} onClick={onAction}>
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

