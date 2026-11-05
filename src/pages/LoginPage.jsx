import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layers, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, toggleDemoMode, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setError(null);
    try {
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify credentials.");
    }
  };

  const handleDemoSignIn = () => {
    toggleDemoMode(true);
    navigate("/");
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
          maxWidth: "420px",
          padding: "36px 32px",
          boxShadow: "var(--shadow-md)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              marginBottom: "14px",
              boxShadow: "0 2px 5px rgba(29, 78, 216, 0.3)",
            }}
          >
            <Layers className="w-5 h-5" />
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Sign in to ConvergeDesk
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            The shared workspace for software engineering teams
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "20px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--status-danger-bg)",
              border: "1px solid var(--status-danger-border)",
              color: "var(--status-danger-text)",
              fontSize: "12.5px",
              lineHeight: 1.4,
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              Username or Email
            </label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="alex.chen"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "22px" }}>
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            style={{ width: "100%", padding: "10px" }}
            icon={ArrowRight}
            iconPosition="right"
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "24px 0",
            gap: "12px",
            color: "var(--text-muted)",
            fontSize: "12px",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
          <span>or explore without login</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
        </div>

        {/* Quick Demo Mode Exploration */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleDemoSignIn}
          style={{ width: "100%", padding: "9px" }}
          icon={Sparkles}
        >
          Explore Demo Workspace
        </Button>

        {/* Register link */}
        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "12.5px",
            color: "var(--text-secondary)",
          }}
        >
          New team member?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
            }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
