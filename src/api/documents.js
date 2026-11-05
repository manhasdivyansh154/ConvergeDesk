import { apiClient, isDemoMode, demoStore } from "./client";

export const documentsApi = {
  async listByProject(projectId) {
    if (isDemoMode()) {
      return demoStore.documents.filter((d) => d.project === Number(projectId));
    }
    try {
      const res = await apiClient.get(`/projects/${projectId}/documents/`);
      return res.data;
    } catch (err) {
      if (!err.response) {
        return demoStore.documents.filter((d) => d.project === Number(projectId));
      }
      throw err;
    }
  },

  async listByWorkspace(workspaceId) {
    if (isDemoMode()) {
      const projectIdsInWs = demoStore.projects
        .filter((p) => p.workspace === Number(workspaceId))
        .map((p) => p.id);
      return demoStore.documents.filter((d) => projectIdsInWs.includes(d.project));
    }
    // Fetch all projects for workspace, then get their documents
    try {
      const projectsRes = await apiClient.get("/projects/");
      const projectsInWs = projectsRes.data.filter((p) => p.workspace === Number(workspaceId));
      const docPromises = projectsInWs.map((p) =>
        apiClient.get(`/projects/${p.id}/documents/`).then((r) => r.data).catch(() => [])
      );
      const results = await Promise.all(docPromises);
      return results.flat();
    } catch (err) {
      if (!err.response) {
        const projectIdsInWs = demoStore.projects
          .filter((p) => p.workspace === Number(workspaceId))
          .map((p) => p.id);
        return demoStore.documents.filter((d) => projectIdsInWs.includes(d.project));
      }
      throw err;
    }
  },

  async get(documentId) {
    if (isDemoMode()) {
      const doc = demoStore.documents.find((d) => d.id === Number(documentId));
      if (!doc) throw new Error("Document not found");
      return { ...doc };
    }
    try {
      const res = await apiClient.get(`/documents/${documentId}/`);
      return res.data;
    } catch (err) {
      if (!err.response) {
        const doc = demoStore.documents.find((d) => d.id === Number(documentId));
        if (doc) return { ...doc };
      }
      throw err;
    }
  },

  async create(projectId, data) {
    if (isDemoMode()) {
      const newDoc = {
        id: Date.now(),
        project: Number(projectId),
        title: data.title,
        content: data.content || "<p>Start collaborating on this document...</p>",
        created_by: demoStore.user.id,
        created_by_username: demoStore.user.username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoStore.documents.unshift(newDoc);
      return newDoc;
    }
    const res = await apiClient.post(`/projects/${projectId}/documents/`, data);
    return res.data;
  },

  async update(documentId, data) {
    if (isDemoMode()) {
      const idx = demoStore.documents.findIndex((d) => d.id === Number(documentId));
      if (idx === -1) throw new Error("Document not found");
      demoStore.documents[idx] = {
        ...demoStore.documents[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { ...demoStore.documents[idx] };
    }
    const res = await apiClient.patch(`/documents/${documentId}/`, data);
    return res.data;
  },

  async delete(documentId) {
    if (isDemoMode()) {
      const idx = demoStore.documents.findIndex((d) => d.id === Number(documentId));
      if (idx !== -1) {
        demoStore.documents.splice(idx, 1);
      }
      return { detail: "Document deleted." };
    }
    const res = await apiClient.delete(`/documents/${documentId}/`);
    return res.data;
  },

  async authorize(documentId) {
    if (isDemoMode()) {
      return { authorized: true, document_id: Number(documentId) };
    }
    const res = await apiClient.get(`/collaboration/documents/${documentId}/authorize/`);
    return res.data;
  },
};

