import React, { useState } from "react";
import { AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";

export function ApiStatusBanner() {
  const { isDemoMode, toggleDemoMode } = useAuth();
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isDemoMode && !feedback) {
    return null;
  }

  const handleTestBackend = async () => {
    setChecking(true);
    setFeedback(null);
    try {
      const res = await authApi.checkHealth();
      if (res.online) {
        setFeedback({ success: true, message: "Connected to live backend at http://localhost:8000! Switching to live mode." });
        setTimeout(() => {
          toggleDemoMode(false);
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ success: false, message: "Backend still unreachable on http://localhost:8000. Continuing in Demo Mode." });
      }
    } catch {
      setFeedback({ success: false, message: "Backend unreachable. Continuing in Demo Mode." });
    } finally {
      setChecking(false);
    }
  };

  return (
    <aside
      style={{
        background: feedback?.success ? "var(--status-success-bg)" : "#f8fafc",
        borderBottom: `1px solid ${feedback?.success ? "var(--status-success-border)" : "var(--border-subtle)"}`,
        padding: "8px 24px",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        color: feedback?.success ? "var(--status-success-text)" : "var(--text-secondary)",
        flexWrap: "wrap",
      }}
      aria-label="System status"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {feedback?.success ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" style={{ color: "var(--status-success-text)" }} />
        ) : (
          <AlertCircle className="w-4 h-4 text-blue-600" style={{ color: "var(--primary)" }} />
        )}
        <span>
          {feedback ? (
            feedback.message
          ) : (
            <>
              <strong>Preview Session:</strong> Running in local interactive demo mode (all 8 screens, task management, and document workflows are active).
            </>
          )}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          type="button"
          onClick={handleTestBackend}
          disabled={checking}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
          <span>{checking ? "Checking..." : "Retry backend (localhost:8000)"}</span>
        </button>
      </div>
    </aside>
  );
}

