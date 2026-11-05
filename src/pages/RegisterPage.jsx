import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layers, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, login, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError(null);
    try {
      await register(username.trim(), email.trim(), password);
      setSuccess(true);
      // Automatically attempt login with new credentials
      try {
        await login(username.trim(), password);
        setTimeout(() => navigate("/"), 1000);
      } catch {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
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
          maxWidth: "440px",
          padding: "36px 32px",
          boxShadow: "var(--shadow-md)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "26px" }}>
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
            Join ConvergeDesk
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Create your account to collaborate on projects and code
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "18px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--status-danger-bg)",
              border: "1px solid var(--status-danger-border)",
              color: "var(--status-danger-text)",
              fontSize: "12.5px",
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "18px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--status-success-bg)",
              border: "1px solid var(--status-success-border)",
              color: "var(--status-success-text)",
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Account created successfully! Signing you in...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-username" className="form-label">
              Username <span className="required-indicator">*</span>
            </label>
            <input
              id="reg-username"
              type="text"
              className="form-input"
              placeholder="e.g. josh.developer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              Email Address <span className="required-indicator">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="josh@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">
              Password <span className="required-indicator">*</span>
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label htmlFor="reg-confirm-password" className="form-label">
              Confirm Password <span className="required-indicator">*</span>
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              className="form-input"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
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
            Create Account
          </Button>
        </form>

        <div
          style={{
            marginTop: "22px",
            textAlign: "center",
            fontSize: "12.5px",
            color: "var(--text-secondary)",
          }}
        >
          Already registered?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

