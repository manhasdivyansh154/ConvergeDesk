import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useWorkspace } from "../../context/WorkspaceContext";
import { workspacesApi } from "../../api/workspaces";
import { Mail, UserPlus } from "lucide-react";

export function InviteOrAddMemberModal({ isOpen, onClose, onMemberAdded, onInvitationSent }) {
  const { currentWorkspace } = useWorkspace();
  const [tab, setTab] = useState("invite"); // "invite" or "add"
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await workspacesApi.sendInvitation(currentWorkspace.id, email.trim().toLowerCase());
      setEmail("");
      setSuccessMsg(res.detail || "Invitation sent successfully!");
      if (onInvitationSent) onInvitationSent(res);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDirect = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await workspacesApi.addMember(currentWorkspace.id, username.trim());
      setUsername("");
      setSuccessMsg(`User @${res.username} added to workspace!`);
      if (onMemberAdded) onMemberAdded(res);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to add member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Teammate to Workspace"
    >
      {/* Subtabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: "18px",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setTab("invite");
            setError(null);
          }}
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            fontWeight: 600,
            color: tab === "invite" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: tab === "invite" ? "2px solid var(--primary)" : "2px solid transparent",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Mail className="w-4 h-4" />
          <span>Email Invitation</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("add");
            setError(null);
          }}
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            fontWeight: 600,
            color: tab === "add" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: tab === "add" ? "2px solid var(--primary)" : "2px solid transparent",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Existing User</span>
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: "16px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--status-danger-bg)",
            border: "1px solid var(--status-danger-border)",
            color: "var(--status-danger-text)",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: "16px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--status-success-bg)",
            border: "1px solid var(--status-success-border)",
            color: "var(--status-success-text)",
            fontSize: "13px",
          }}
        >
          {successMsg}
        </div>
      )}

      {tab === "invite" ? (
        <form onSubmit={handleSendInvite}>
          <div className="form-group">
            <label htmlFor="invite-email" className="form-label">
              Teammate's Email Address <span className="required-indicator">*</span>
            </label>
            <input
              id="invite-email"
              type="email"
              className="form-input"
              placeholder="developer@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <span className="form-hint">
              An invitation link valid for 7 days will be emailed to join <strong>{currentWorkspace?.name}</strong>.
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" loading={loading} type="submit" icon={Mail}>
              Send Invitation
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAddDirect}>
          <div className="form-group">
            <label htmlFor="member-username" className="form-label">
              Username <span className="required-indicator">*</span>
            </label>
            <input
              id="member-username"
              type="text"
              className="form-input"
              placeholder="e.g. sarah.dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <span className="form-hint">
              Instantly grants membership to an existing registered user in this workspace.
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" loading={loading} type="submit" icon={UserPlus}>
              Add Member
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

