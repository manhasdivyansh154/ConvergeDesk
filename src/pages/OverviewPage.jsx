import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FolderGit2,
  CheckSquare,
  FileText,
  Plus,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  FileEdit,
  UserPlus,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { projectsApi } from "../api/projects";
import { tasksApi } from "../api/tasks";
import { documentsApi } from "../api/documents";
import { Button } from "../components/common/Button";
import { ProjectStatusBadge, TaskPriorityBadge, TaskStatusBadge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { CreateProjectModal } from "../components/projects/CreateProjectModal";
import { CreateTaskModal } from "../components/tasks/CreateTaskModal";
import { InviteOrAddMemberModal } from "../components/members/InviteOrAddMemberModal";

export function OverviewPage() {
  const { currentWorkspace, members } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setProjects([]);
      setTasks([]);
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [projList, taskList, docList] = await Promise.all([
        projectsApi.list(currentWorkspace.id),
        tasksApi.list({ workspaceId: currentWorkspace.id }),
        documentsApi.listByWorkspace(currentWorkspace.id),
      ]);
      setProjects(projList);
      setTasks(taskList);
      setDocuments(docList);
    } catch (err) {
      console.error("Failed to load overview data", err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle direct task status update
  const handleToggleTaskStatus = async (task) => {
    const nextStatus =
      task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO";
    try {
      const updated = await tasksApi.update(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="page-wrapper">
        <EmptyState
          icon={FolderGit2}
          title="No workspace selected"
          description="Create a workspace or switch to an existing one from the top bar to view projects and tasks."
        />
      </div>
    );
  }

  // Metrics
  const activeProjectsCount = projects.filter((p) => p.status === "ACTIVE").length;
  const openTasks = tasks.filter((t) => t.status !== "DONE");
  const highPriorityTasks = openTasks.filter((t) => t.priority === "HIGH");
  const attentionTasks = tasks
    .filter((t) => t.status !== "DONE")
    .sort((a, b) => (b.priority === "HIGH" ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title-group">
          <h1>Workspace Overview</h1>
          <p className="page-subtitle">
            Welcome to <strong>{currentWorkspace.name}</strong> • {projects.length} projects • {members.length} members
          </p>
        </div>

        <div className="page-header-actions">
          <Button
            variant="secondary"
            icon={UserPlus}
            onClick={() => setInviteModalOpen(true)}
          >
            Invite Member
          </Button>
          <Button
            variant="secondary"
            icon={CheckSquare}
            onClick={() => setCreateTaskOpen(true)}
          >
            New Task
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateProjectOpen(true)}
          >
            New Project
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading workspace metrics and activity..." fullPage />
      ) : (
        <>
          {/* Flat Single-Surface Metrics Summary */}
          <div
            className="surface-card"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              padding: "16px 24px",
              marginBottom: "28px",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 550, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Active Projects
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {activeProjectsCount}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  of {projects.length} total
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 550, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Open Tasks
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {openTasks.length}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {tasks.length - openTasks.length} completed
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 550, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                High Priority
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "26px", fontWeight: 700, color: highPriorityTasks.length > 0 ? "var(--status-danger-text)" : "var(--text-primary)" }}>
                  {highPriorityTasks.length}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  requiring attention
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 550, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Shared Documents
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {documents.length}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  with live CRDT
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Responsive Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Left Column: Tasks Needing Attention */}
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
                  <AlertTriangle className="w-4 h-4 text-amber-600" style={{ color: "var(--status-warning-text)" }} />
                  <h2 style={{ fontSize: "15px", fontWeight: 650 }}>Tasks Needing Attention</h2>
                </div>
                <Link
                  to="/tasks"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "var(--primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {attentionTasks.length === 0 ? (
                <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  <CheckCircle2 className="w-6 h-6" style={{ margin: "0 auto 8px", color: "var(--status-success-text)" }} />
                  All caught up! No urgent tasks pending.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {attentionTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--bg-surface-subtle)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task)}
                        title={`Click to mark ${task.status === "TODO" ? "In Progress" : task.status === "IN_PROGRESS" ? "Done" : "To Do"}`}
                        style={{ marginTop: "2px", color: "var(--text-muted)" }}
                      >
                        {task.status === "DONE" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" style={{ color: "var(--status-success-text)" }} />
                        ) : task.status === "IN_PROGRESS" ? (
                          <Clock className="w-4 h-4 text-amber-600" style={{ color: "var(--status-warning-text)" }} />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "13.5px",
                            fontWeight: 550,
                            color: "var(--text-primary)",
                            marginBottom: "4px",
                          }}
                        >
                          {task.title}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "11.5px", color: "var(--text-muted)" }}>
                          <TaskPriorityBadge priority={task.priority} />
                          <TaskStatusBadge status={task.status} />
                          {task.due_date && <span>Due: {task.due_date}</span>}
                          {task.assigned_to_username && <span>• @{task.assigned_to_username}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Active Projects */}
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
                  <FolderGit2 className="w-4 h-4 text-blue-600" style={{ color: "var(--primary)" }} />
                  <h2 style={{ fontSize: "15px", fontWeight: 650 }}>Projects</h2>
                </div>
                <Link
                  to="/projects"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "var(--primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  All Projects <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {projects.length === 0 ? (
                <EmptyState
                  icon={FolderGit2}
                  title="No projects yet"
                  description="Start by creating your first project for this team workspace."
                  actionLabel="Create Project"
                  onAction={() => setCreateProjectOpen(true)}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {projects.slice(0, 4).map((proj) => {
                    const projTasks = tasks.filter((t) => t.project === proj.id);
                    const doneTasks = projTasks.filter((t) => t.status === "DONE");
                    const progress = projTasks.length > 0 ? Math.round((doneTasks.length / projTasks.length) * 100) : 0;

                    return (
                      <Link
                        key={proj.id}
                        to={`/projects/${proj.id}`}
                        style={{
                          display: "block",
                          padding: "12px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-subtle)",
                          backgroundColor: "var(--bg-surface-subtle)",
                          transition: "border-color var(--transition-fast)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {proj.name}
                          </span>
                          <ProjectStatusBadge status={proj.status} />
                        </div>

                        {proj.description && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                              margin: "0 0 8px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {proj.description}
                          </p>
                        )}

                        {/* Progress Bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
                          <div
                            style={{
                              flex: 1,
                              height: "5px",
                              borderRadius: "var(--radius-full)",
                              backgroundColor: "var(--border-subtle)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${progress}%`,
                                height: "100%",
                                backgroundColor: "var(--primary)",
                                borderRadius: "var(--radius-full)",
                              }}
                            />
                          </div>
                          <span>{progress}% ({doneTasks.length}/{projTasks.length} tasks)</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Recent Shared Documents */}
          <div className="surface-card" style={{ padding: "20px", marginTop: "24px" }}>
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
                <FileText className="w-4 h-4 text-blue-600" style={{ color: "var(--primary)" }} />
                <h2 style={{ fontSize: "15px", fontWeight: 650 }}>Shared Architecture & Technical Documents</h2>
              </div>
              <Link
                to="/documents"
                style={{
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "var(--primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Browse All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {documents.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No shared documents created yet in this workspace.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "14px",
                }}
              >
                {documents.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-surface-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                        Author: @{doc.created_by_username || "team"}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Link
                        to={`/documents/${doc.id}/edit`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Open Collaborative Editor</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onProjectCreated={() => loadData()}
      />

      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projects={projects}
        onTaskSaved={() => loadData()}
      />

      <InviteOrAddMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onMemberAdded={() => loadData()}
        onInvitationSent={() => loadData()}
      />
    </div>
  );
}
