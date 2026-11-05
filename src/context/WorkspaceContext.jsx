import React, { createContext, useState, useEffect, useCallback } from "react";
import { workspacesApi } from "../api/workspaces";
import { useAuth } from "./AuthContext";

export const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await workspacesApi.list();
      setWorkspaces(list);
      if (list.length > 0) {
        // preserve current workspace if still in list, else select first
        setCurrentWorkspace((prev) => {
          if (prev && list.some((w) => w.id === prev.id)) {
            return list.find((w) => w.id === prev.id);
          }
          return list[0];
        });
      } else {
        setCurrentWorkspace(null);
      }
    } catch (err) {
      console.error("Failed to load workspaces", err);
      setError(err.message || "Failed to load workspaces");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchMembers = useCallback(async (wsId) => {
    if (!wsId) {
      setMembers([]);
      return;
    }
    try {
      const list = await workspacesApi.getMembers(wsId);
      setMembers(list);
    } catch (err) {
      console.error("Failed to load workspace members", err);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchMembers(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, fetchMembers]);

  const createWorkspace = async ({ name, slug }) => {
    const newWs = await workspacesApi.create({ name, slug });
    await fetchWorkspaces();
    setCurrentWorkspace(newWs);
    return newWs;
  };

  // Determine current user's role in this workspace
  const currentUserMembership = members.find(
    (m) => m.username?.toLowerCase() === user?.username?.toLowerCase() || m.user === user?.id
  );
  const userRole = currentUserMembership?.role || (currentWorkspace?.created_by === user?.id ? "OWNER" : "MEMBER");
  const isOwner = userRole === "OWNER";
  const isAdmin = userRole === "ADMIN" || isOwner;

  const value = {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    members,
    userRole,
    isOwner,
    isAdmin,
    isLoading,
    error,
    refreshWorkspaces: fetchWorkspaces,
    refreshMembers: () => fetchMembers(currentWorkspace?.id),
    createWorkspace,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export { useWorkspace } from "./useWorkspace";
