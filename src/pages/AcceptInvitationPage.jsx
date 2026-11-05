import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MailCheck, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { workspacesApi } from "../api/workspaces";
import { Button } from "../components/common/Button";

export function AcceptInvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { refreshWorkspaces } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workspacesApi.acceptInvitation(token);
      setSuccess(res);
      await refreshWorkspaces();
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Could not accept invitation.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        backgroundColor: "var(--bg-app)",
        padding: "24px 16px",
      }}
    >
      <div
        className="surface-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px 32px",
          boxShadow: "var(--shadow-md)",
          borderRadius: "var(--radius-lg)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--primary-subtle)",
            color: "var(--primary)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
          }}
        >
          <MailCheck className="w-6 h-6" />
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
          Workspace Invitation
        </h1>

        <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.5 }}>
          You have been invited to join a collaborative workspace on ConvergeDesk.
        </p>

        {error && (
          <div
            style={{
              padding: "12px 14px",
              marginBottom: "20px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--status-danger-bg)",
              border: "1px solid var(--status-danger-border)",
              color: "var(--status-danger-text)",
              fontSize: "13px",
              textAlign: "left",
              display: "flex",
              gap: "8px",
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {success ? (
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--status-success-bg)",
              border: "1px solid var(--status-success-border)",
              color: "var(--status-success-text)",
              fontSize: "13.5px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "4px" }}>
              Welcome to {success.workspace_name}!
            </div>
            <div>{success.detail} Redirecting to workspace...</div>
          </div>
        ) : (
          <div>
            {!isAuthenticated ? (
              <div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Please sign in with the email address that received the invitation to accept.
                </p>
                <Link to="/login" className="btn btn-primary" style={{ width: "100%" }}>
                  Sign In to Accept
                </Link>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-surface-subtle)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "12.5px",
                    textAlign: "left",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ color: "var(--text-muted)" }}>Logged in as:</div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                    {user?.username} ({user?.email || "No email in profile"})
                  </div>
                </div>

                <Button
                  variant="primary"
                  loading={loading}
                  onClick={handleAccept}
                  style={{ width: "100%", padding: "10px" }}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Accept & Join Workspace
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
