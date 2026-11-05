import { apiClient, isDemoMode, demoStore } from "./client";

export const projectsApi = {
  async list(workspaceId = null) {
    if (isDemoMode()) {
      let list = [...demoStore.projects];
      if (workspaceId) {
        list = list.filter((p) => p.workspace === Number(workspaceId));
      }
      return list;
    }
    try {
      const res = await apiClient.get("/projects/");
      let list = res.data;
      if (workspaceId) {
        list = list.filter((p) => p.workspace === Number(workspaceId));
      }
      return list;
    } catch (err) {
      if (!err.response) {
        let list = [...demoStore.projects];
        if (workspaceId) list = list.filter((p) => p.workspace === Number(workspaceId));
        return list;
      }
      throw err;
    }
  },

  async get(projectId) {
    if (isDemoMode()) {
      const p = demoStore.projects.find((item) => item.id === Number(projectId));
      if (!p) throw new Error("Project not found");
      return { ...p };
    }
    try {
      const res = await apiClient.get(`/projects/${projectId}/`);
      return res.data;
    } catch (err) {
      if (!err.response) {
        const p = demoStore.projects.find((item) => item.id === Number(projectId));
        if (p) return { ...p };
      }
      throw err;
    }
  },

  async create(data) {
    if (isDemoMode()) {
      const ws = demoStore.workspaces.find((w) => w.id === Number(data.workspace));
      const newProj = {
        id: Date.now(),
        workspace: Number(data.workspace),
        workspace_name: ws ? ws.name : "Workspace",
        name: data.name,
        description: data.description || "",
        status: data.status || "ACTIVE",
        created_by: demoStore.user.id,
        created_by_username: demoStore.user.username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoStore.projects.unshift(newProj);
      return newProj;
    }
    const res = await apiClient.post("/projects/", data);
    return res.data;
  },

  async update(projectId, data) {
    if (isDemoMode()) {
      const idx = demoStore.projects.findIndex((p) => p.id === Number(projectId));
      if (idx === -1) throw new Error("Project not found");
      demoStore.projects[idx] = {
        ...demoStore.projects[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { ...demoStore.projects[idx] };
    }
    const res = await apiClient.patch(`/projects/${projectId}/`, data);
    return res.data;
  },

  async delete(projectId) {
    if (isDemoMode()) {
      const idx = demoStore.projects.findIndex((p) => p.id === Number(projectId));
      if (idx !== -1) {
        demoStore.projects.splice(idx, 1);
        // clean up associated tasks and docs
        demoStore.tasks = demoStore.tasks.filter((t) => t.project !== Number(projectId));
        demoStore.documents = demoStore.documents.filter((d) => d.project !== Number(projectId));
      }
      return { detail: "Project deleted." };
    }
    const res = await apiClient.delete(`/projects/${projectId}/`);
    return res.data;
  },
};

