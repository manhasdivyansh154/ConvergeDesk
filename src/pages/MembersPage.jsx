import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import { workspacesApi } from "../api/workspaces";
import { Button } from "../components/common/Button";
import { RoleBadge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { InviteOrAddMemberModal } from "../components/members/InviteOrAddMemberModal";

export function MembersPage() {
  const { currentWorkspace, members, refreshMembers, isOwner, isAdmin } = useWorkspace();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [actionError, setActionError] = useState(null);

  const loadData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    setActionError(null);
    try {
      await refreshMembers();
      if (isAdmin || isOwner) {
        const invList = await workspacesApi.getPendingInvitations(currentWorkspace.id);
        setInvitations(invList);
      }
    } catch (err) {
      console.error("Failed to load members/invitations", err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, isAdmin, isOwner, refreshMembers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = async (member, newRole) => {
    if (member.role === newRole) return;
    setActionError(null);
    try {
      await workspacesApi.updateMemberRole(currentWorkspace.id, member.id, newRole);
      await refreshMembers();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to update role.";
      setActionError(msg);
    }
  };

  const handleRemoveMember = async (member) => {
    if (member.role === "OWNER") {
      alert("The workspace owner cannot be removed.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove @${member.username} from this workspace?`)) {
      return;
    }
    setActionError(null);
    try {
      await workspacesApi.removeMember(currentWorkspace.id, member.id);
      await refreshMembers();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to remove member.";
      setActionError(msg);
    }
  };

  const handleRevokeInvitation = async (invitation) => {
    if (!window.confirm(`Revoke invitation for ${invitation.email}?`)) return;
    setActionError(null);
    try {
      await workspacesApi.revokeInvitation(currentWorkspace.id, invitation.id);
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to revoke invitation.";
      setActionError(msg);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="page-wrapper">
        <EmptyState
          icon={Users}
          title="No workspace selected"
          description="Select or create a workspace to manage team membership."
        />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-title-group">
          <h1>Team & Invitations</h1>
          <p className="page-subtitle">
            Manage teammate access, roles, and pending invitations for <strong>{currentWorkspace.name}</strong>
          </p>
        </div>

        <div className="page-header-actions">
          {(isAdmin || isOwner) && (
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => setInviteModalOpen(true)}
            >
              Add Teammate
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: "20px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--status-danger-bg)",
            border: "1px solid var(--status-danger-border)",
            color: "var(--status-danger-text)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading workspace team and invites..." fullPage />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Active Members Section */}
          <div className="surface-card" style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users className="w-4 h-4 text-blue-600" style={{ color: "var(--primary)" }} />
                <h2 style={{ fontSize: "15px", fontWeight: 650 }}>
                  Active Workspace Members ({members.length})
                </h2>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      color: "var(--text-muted)",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    <th style={{ padding: "10px 12px", fontWeight: 600 }}>Member</th>
                    <th style={{ padding: "10px 12px", fontWeight: 600 }}>Email</th>
                    <th style={{ padding: "10px 12px", fontWeight: 600 }}>Role</th>
                    <th style={{ padding: "10px 12px", fontWeight: 600 }}>Joined</th>
                    {(isAdmin || isOwner) && (
                      <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const isSelf = member.username?.toLowerCase() === user?.username?.toLowerCase();

                    return (
                      <tr
                        key={member.id}
                        style={{
                          borderBottom: "1px solid var(--border-light)",
                          transition: "background-color var(--transition-fast)",
                        }}
                      >
                        <td style={{ padding: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "var(--radius-sm)",
                                backgroundColor: "var(--bg-surface-hover)",
                                color: "var(--text-primary)",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 600,
                                fontSize: "12px",
                              }}
                            >
                              {member.username ? member.username[0].toUpperCase() : "U"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                {member.username} {isSelf && <span style={{ color: "var(--primary)", fontSize: "11px" }}>(You)</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                          {member.email || "—"}
                        </td>

                        <td style={{ padding: "12px" }}>
                          {isOwner && member.role !== "OWNER" ? (
                            <select
                              className="form-select"
                              style={{ width: "auto", padding: "4px 8px", fontSize: "12px" }}
                              value={member.role}
                              onChange={(e) => handleRoleChange(member, e.target.value)}
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="MEMBER">Member</option>
                            </select>
                          ) : (
                            <RoleBadge role={member.role} />
                          )}
                        </td>

                        <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "12px" }}>
                          {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "—"}
                        </td>

                        {(isAdmin || isOwner) && (
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {member.role !== "OWNER" && !isSelf && (
                              <button
                                type="button"
                                className="btn-ghost btn-sm"
                                style={{ color: "var(--status-danger-text)", padding: "5px 8px" }}
                                onClick={() => handleRemoveMember(member)}
                                title="Remove member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Invitations Section */}
          {(isAdmin || isOwner) && (
            <div className="surface-card" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail className="w-4 h-4 text-blue-600" style={{ color: "var(--primary)" }} />
                  <h2 style={{ fontSize: "15px", fontWeight: 650 }}>
                    Pending Email Invitations ({invitations.length})
                  </h2>
                </div>
              </div>

              {invitations.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No pending invitations. All invited members have either joined or their invites expired.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                      fontSize: "13px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          color: "var(--text-muted)",
                          fontSize: "11.5px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        <th style={{ padding: "10px 12px", fontWeight: 600 }}>Invited Email</th>
                        <th style={{ padding: "10px 12px", fontWeight: 600 }}>Invited By</th>
                        <th style={{ padding: "10px 12px", fontWeight: 600 }}>Expires</th>
                        <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Revoke</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map((inv) => (
                        <tr
                          key={inv.id}
                          style={{
                            borderBottom: "1px solid var(--border-light)",
                          }}
                        >
                          <td style={{ padding: "12px", fontWeight: 550, color: "var(--text-primary)" }}>
                            {inv.email}
                          </td>
                          <td style={{ padding: "12px", color: "var(--text-muted)" }}>
                            @{inv.invited_by_username || "admin"}
                          </td>
                          <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "12px" }}>
                            {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : "7 days"}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRevokeInvitation(inv)}
                            >
                              Revoke
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <InviteOrAddMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onMemberAdded={() => loadData()}
        onInvitationSent={() => loadData()}
      />
    </div>
  );
}
