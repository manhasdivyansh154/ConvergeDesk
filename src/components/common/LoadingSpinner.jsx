import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Loading...", fullPage = false }) {
  if (fullPage) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: "12px",
          color: "var(--text-muted)",
        }}
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" style={{ color: "var(--primary)" }} />
        <span style={{ fontSize: "13px" }}>{text}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "var(--text-muted)",
        fontSize: "13px",
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="w-4 h-4 animate-spin text-primary" style={{ color: "var(--primary)" }} />
      <span>{text}</span>
    </div>
  );
}

export function Skeleton({ width = "100%", height = "20px", borderRadius = "var(--radius-sm)", style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "var(--bg-surface-subtle)",
        backgroundImage: "linear-gradient(90deg, var(--bg-surface-subtle) 0%, #e2e8f0 50%, var(--bg-surface-subtle) 100%)",
        backgroundSize: "200% 100%",
        animation: "skeletonPulse 1.5s ease-in-out infinite",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

