import { apiClient, isDemoMode, demoStore } from "./client";

export const workspacesApi = {
  async list() {
    if (isDemoMode()) {
      return [...demoStore.workspaces];
    }
    try {
      const res = await apiClient.get("/workspaces/");
      return res.data;
    } catch (err) {
      if (!err.response) return [...demoStore.workspaces];
      throw err;
    }
  },

  async create(data) {
    if (isDemoMode()) {
      const newWs = {
        id: Date.now(),
        name: data.name,
        slug: (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
        created_by: demoStore.user.id,
        created_at: new Date().toISOString(),
      };
      demoStore.workspaces.push(newWs);
      // Owner membership
      demoStore.members.push({
        id: Date.now() + 1,
        workspace: newWs.id,
        user: demoStore.user.id,
        username: demoStore.user.username,
        email: demoStore.user.email,
        role: "OWNER",
        joined_at: new Date().toISOString(),
      });
      return newWs;
    }
    const res = await apiClient.post("/workspaces/", data);
    return res.data;
  },

  async getMembers(workspaceId) {
    if (isDemoMode()) {
      return demoStore.members.filter((m) => m.workspace === Number(workspaceId));
    }
    try {
      const res = await apiClient.get(`/workspaces/${workspaceId}/members/`);
      return res.data;
    } catch (err) {
      if (!err.response) {
        return demoStore.members.filter((m) => m.workspace === Number(workspaceId));
      }
      throw err;
    }
  },

  async addMember(workspaceId, username) {
    if (isDemoMode()) {
      const existing = demoStore.members.find(
        (m) => m.workspace === Number(workspaceId) && m.username.toLowerCase() === username.toLowerCase()
      );
      if (existing) {
        throw new Error("This user is already a workspace member.");
      }
      const newMember = {
        id: Date.now(),
        workspace: Number(workspaceId),
        user: Date.now(),
        username,
        email: `${username}@example.com`,
        role: "MEMBER",
        joined_at: new Date().toISOString(),
      };
      demoStore.members.push(newMember);
      return newMember;
    }
    const res = await apiClient.post(`/workspaces/${workspaceId}/members/add/`, { username });
    return res.data;
  },

  async updateMemberRole(workspaceId, memberId, role) {
    if (isDemoMode()) {
      const member = demoStore.members.find(
        (m) => m.workspace === Number(workspaceId) && m.id === Number(memberId)
      );
      if (!member) throw new Error("Member not found");
      if (member.role === "OWNER") throw new Error("The owner's role cannot be changed.");
      member.role = role;
      return { ...member };
    }
    const res = await apiClient.patch(`/workspaces/${workspaceId}/members/${memberId}/role/`, { role });
    return res.data;
  },

  async removeMember(workspaceId, memberId) {
    if (isDemoMode()) {
      const idx = demoStore.members.findIndex(
        (m) => m.workspace === Number(workspaceId) && m.id === Number(memberId)
      );
      if (idx !== -1) {
        if (demoStore.members[idx].role === "OWNER") {
          throw new Error("The workspace owner cannot be removed.");
        }
        demoStore.members.splice(idx, 1);
      }
      return { detail: "Member removed from workspace successfully." };
    }
    const res = await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}/`);
    return res.data;
  },

  async getPendingInvitations(workspaceId) {
    if (isDemoMode()) {
      return demoStore.invitations.filter(
        (inv) => inv.workspace === Number(workspaceId) && inv.status === "PENDING"
      );
    }
    try {
      const res = await apiClient.get(`/workspaces/${workspaceId}/invitations/pending/`);
      return res.data;
    } catch (err) {
      if (!err.response) {
        return demoStore.invitations.filter(
          (inv) => inv.workspace === Number(workspaceId) && inv.status === "PENDING"
        );
      }
      throw err;
    }
  },

  async sendInvitation(workspaceId, email) {
    if (isDemoMode()) {
      const existing = demoStore.invitations.find(
        (inv) => inv.workspace === Number(workspaceId) && inv.email.toLowerCase() === email.toLowerCase() && inv.status === "PENDING"
      );
      if (existing) {
        throw new Error("A pending invitation already exists for this email.");
      }
      const newInv = {
        id: Date.now(),
        workspace: Number(workspaceId),
        email,
        invited_by_username: demoStore.user.username,
        status: "PENDING",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        token: `inv-${Date.now()}`,
      };
      demoStore.invitations.push(newInv);
      return {
        detail: "Invitation email sent successfully.",
        email,
        expires_at: newInv.expires_at,
      };
    }
    const res = await apiClient.post(`/workspaces/${workspaceId}/invitations/`, { email });
    return res.data;
  },

  async revokeInvitation(workspaceId, invitationId) {
    if (isDemoMode()) {
      const inv = demoStore.invitations.find(
        (i) => i.workspace === Number(workspaceId) && i.id === Number(invitationId)
      );
      if (inv) inv.status = "REVOKED";
      return { detail: "Invitation revoked successfully." };
    }
    const res = await apiClient.post(`/workspaces/${workspaceId}/invitations/${invitationId}/revoke/`);
    return res.data;
  },

  async acceptInvitation(token) {
    if (isDemoMode()) {
      return {
        detail: "Invitation accepted successfully (Demo Mode).",
        workspace_id: 1,
        workspace_name: "Acme Engineering",
        role: "MEMBER",
        membership_created: true,
      };
    }
    const res = await apiClient.post(`/invitations/${token}/accept/`);
    return res.data;
  },
};

