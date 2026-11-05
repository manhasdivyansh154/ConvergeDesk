import { apiClient, isDemoMode, demoStore } from "./client";

export const tasksApi = {
  async list({ workspaceId = null, projectId = null, status = null, priority = null } = {}) {
    if (isDemoMode()) {
      let list = [...demoStore.tasks];
      if (projectId) {
        list = list.filter((t) => t.project === Number(projectId));
      } else if (workspaceId) {
        const projectIdsInWs = demoStore.projects
          .filter((p) => p.workspace === Number(workspaceId))
          .map((p) => p.id);
        list = list.filter((t) => projectIdsInWs.includes(t.project));
      }
      if (status) list = list.filter((t) => t.status === status);
      if (priority) list = list.filter((t) => t.priority === priority);
      return list;
    }
    try {
      const res = await apiClient.get("/tasks/");
      let list = res.data;
      if (projectId) {
        list = list.filter((t) => t.project === Number(projectId));
      }
      if (status) list = list.filter((t) => t.status === status);
      if (priority) list = list.filter((t) => t.priority === priority);
      return list;
    } catch (err) {
      if (!err.response) {
        let list = [...demoStore.tasks];
        if (projectId) list = list.filter((t) => t.project === Number(projectId));
        return list;
      }
      throw err;
    }
  },

  async get(taskId) {
    if (isDemoMode()) {
      const t = demoStore.tasks.find((item) => item.id === Number(taskId));
      if (!t) throw new Error("Task not found");
      return { ...t };
    }
    try {
      const res = await apiClient.get(`/tasks/${taskId}/`);
      return res.data;
    } catch (err) {
      if (!err.response) {
        const t = demoStore.tasks.find((item) => item.id === Number(taskId));
        if (t) return { ...t };
      }
      throw err;
    }
  },

  async create(data) {
    if (isDemoMode()) {
      let assigneeName = null;
      if (data.assigned_to) {
        const m = demoStore.members.find((member) => member.user === Number(data.assigned_to) || member.id === Number(data.assigned_to));
        assigneeName = m ? m.username : null;
      }
      const newTask = {
        id: Date.now(),
        project: Number(data.project),
        title: data.title,
        description: data.description || "",
        status: data.status || "TODO",
        priority: data.priority || "MEDIUM",
        assigned_to: data.assigned_to ? Number(data.assigned_to) : null,
        assigned_to_username: assigneeName,
        due_date: data.due_date || null,
        created_by: demoStore.user.id,
        created_by_username: demoStore.user.username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoStore.tasks.unshift(newTask);
      return newTask;
    }
    const res = await apiClient.post("/tasks/", data);
    return res.data;
  },

  async update(taskId, data) {
    if (isDemoMode()) {
      const idx = demoStore.tasks.findIndex((t) => t.id === Number(taskId));
      if (idx === -1) throw new Error("Task not found");
      let assigneeName = demoStore.tasks[idx].assigned_to_username;
      if ("assigned_to" in data) {
        if (data.assigned_to) {
          const m = demoStore.members.find((member) => member.user === Number(data.assigned_to) || member.id === Number(data.assigned_to));
          assigneeName = m ? m.username : null;
        } else {
          assigneeName = null;
        }
      }
      demoStore.tasks[idx] = {
        ...demoStore.tasks[idx],
        ...data,
        assigned_to_username: assigneeName,
        updated_at: new Date().toISOString(),
      };
      return { ...demoStore.tasks[idx] };
    }
    const res = await apiClient.patch(`/tasks/${taskId}/`, data);
    return res.data;
  },

  async delete(taskId) {
    if (isDemoMode()) {
      const idx = demoStore.tasks.findIndex((t) => t.id === Number(taskId));
      if (idx !== -1) {
        demoStore.tasks.splice(idx, 1);
      }
      return { detail: "Task deleted." };
    }
    const res = await apiClient.delete(`/tasks/${taskId}/`);
    return res.data;
  },
};

