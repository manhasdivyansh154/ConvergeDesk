import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FolderGit2,
  ArrowLeft,
  Plus,
  CheckSquare,
  FileText,
  Clock,
  CheckCircle2,
  Circle,
  FileEdit,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { projectsApi } from "../api/projects";
import { tasksApi } from "../api/tasks";
import { documentsApi } from "../api/documents";
import { Button } from "../components/common/Button";
import { ProjectStatusBadge, TaskPriorityBadge, TaskStatusBadge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Modal } from "../components/common/Modal";
import { CreateTaskModal } from "../components/tasks/CreateTaskModal";
import { CreateDocumentModal } from "../components/documents/CreateDocumentModal";

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isOwner } = useWorkspace();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "documents"

  // Modals
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Edit Project form state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [savingProject, setSavingProject] = useState(false);

  const loadProjectData = useCallback(async () => {
    setLoading(true);
    try {
      const proj = await projectsApi.get(id);
      setProject(proj);
      setEditName(proj.name);
      setEditDesc(proj.description || "");
      setEditStatus(proj.status);

      const [tList, dList] = await Promise.all([
        tasksApi.list({ projectId: proj.id }),
        documentsApi.listByProject(proj.id),
      ]);
      setTasks(tList);
      setDocuments(dList);
    } catch (err) {
      console.error("Failed to load project detail", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      const updated = await projectsApi.update(project.id, {
        name: editName,
        description: editDesc,
        status: editStatus,
      });
      setProject(updated);
      setEditProjectOpen(false);
    } catch (err) {
      alert(err.message || "Failed to update project");
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectsApi.delete(project.id);
      navigate("/projects");
    } catch (err) {
      alert(err.message || "Failed to delete project");
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const nextStatus =
      task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO";
    try {
      const updated = await tasksApi.update(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await tasksApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentsApi.delete(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err.message || "Failed to delete document");
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingSpinner text="Loading project details..." fullPage />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-wrapper">
        <EmptyState
          icon={FolderGit2}
          title="Project not found"
          description="The requested project may have been deleted or moved."
          actionLabel="Return to Projects"
          onAction={() => navigate("/projects")}
        />
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "DONE");
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="page-wrapper">
      {/* Back Link */}
      <Link
        to="/projects"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12.5px",
          color: "var(--text-muted)",
          marginBottom: "16px",
        }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Projects</span>
      </Link>

      {/* Project Header Card */}
      <div
        className="surface-card"
        style={{
          padding: "24px",
          marginBottom: "24px",
          borderRadius: "var(--radius-md)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                {project.name}
              </h1>
              <ProjectStatusBadge status={project.status} />
            </div>

            {project.description && (
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", margin: 0, maxWidth: "720px", lineHeight: 1.5 }}>
                {project.description}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              variant="secondary"
              size="sm"
              icon={Edit2}
              onClick={() => setEditProjectOpen(true)}
            >
              Edit Details
            </Button>

            {(isAdmin || isOwner) && (
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Project Meta Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "12px",
            color: "var(--text-muted)",
            paddingTop: "14px",
            borderTop: "1px solid var(--border-subtle)",
            flexWrap: "wrap",
          }}
        >
          <span>Created by: @{project.created_by_username || "team"}</span>
          <span>Workspace: {project.workspace_name}</span>
          <span>Tasks: {completedTasks.length}/{tasks.length} Completed ({progress}%)</span>
          <span>Documents: {documents.length}</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: "20px",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          style={{
            padding: "10px 16px",
            fontSize: "13.5px",
            fontWeight: 600,
            color: activeTab === "tasks" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "tasks" ? "2px solid var(--primary)" : "2px solid transparent",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks ({tasks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          style={{
            padding: "10px 16px",
            fontSize: "13.5px",
            fontWeight: 600,
            color: activeTab === "documents" ? "var(--primary)" : "var(--text-muted)",
            borderBottom: activeTab === "documents" ? "2px solid var(--primary)" : "2px solid transparent",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <FileText className="w-4 h-4" />
          <span>Shared Documents ({documents.length})</span>
        </button>
      </div>

      {/* Tab: Tasks */}
      {activeTab === "tasks" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 650 }}>Project Tasks</h2>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingTask(null);
                setCreateTaskOpen(true);
              }}
            >
              Add Task
            </Button>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks in this project"
              description="Add tasks to plan sprint backlog, delegate issues, and track progress."
              actionLabel="Add Task"
              onAction={() => {
                setEditingTask(null);
                setCreateTaskOpen(true);
              }}
            />
          ) : (
            <div className="surface-card" style={{ padding: "8px 12px" }}>
              {tasks.map((task, idx) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 10px",
                    borderBottom: idx < tasks.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task)}
                      title={`Click to toggle status (Current: ${task.status})`}
                      style={{ marginTop: "2px" }}
                    >
                      {task.status === "DONE" ? (
                        <CheckCircle2 className="w-4 h-4" style={{ color: "var(--status-success-text)" }} />
                      ) : task.status === "IN_PROGRESS" ? (
                        <Clock className="w-4 h-4" style={{ color: "var(--status-warning-text)" }} />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 550,
                          color: task.status === "DONE" ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: task.status === "DONE" ? "line-through" : "none",
                        }}
                      >
                        {task.title}
                      </div>

                      {task.description && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {task.description}
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", flexWrap: "wrap", fontSize: "11px", color: "var(--text-muted)" }}>
                        <TaskPriorityBadge priority={task.priority} />
                        <TaskStatusBadge status={task.status} />
                        {task.due_date && <span>Due: {task.due_date}</span>}
                        {task.assigned_to_username && <span>Assignee: @{task.assigned_to_username}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => {
                        setEditingTask(task);
                        setCreateTaskOpen(true);
                      }}
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                      style={{ color: "var(--status-danger-text)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === "documents" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 650 }}>Project Documents & Notes</h2>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setCreateDocOpen(true)}
            >
              New Document
            </Button>
          </div>

          {documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents attached to this project"
              description="Create a real-time collaborative document for RFCs, sprint planning, or system architecture."
              actionLabel="New Document"
              onAction={() => setCreateDocOpen(true)}
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="surface-card"
                  style={{
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <Link
                        to={`/documents/${doc.id}/edit`}
                        style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)" }}
                      >
                        {doc.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="btn-ghost btn-sm"
                        style={{ color: "var(--status-danger-text)", padding: "4px" }}
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
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
      )}

      {/* Edit Project Modal */}
      <Modal
        isOpen={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        title="Edit Project Details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditProjectOpen(false)} disabled={savingProject}>
              Cancel
            </Button>
            <Button variant="primary" loading={savingProject} onClick={handleUpdateProject}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateProject}>
          <div className="form-group">
            <label htmlFor="edit-proj-name" className="form-label">
              Project Name <span className="required-indicator">*</span>
            </label>
            <input
              id="edit-proj-name"
              type="text"
              className="form-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-proj-desc" className="form-label">
              Description
            </label>
            <textarea
              id="edit-proj-desc"
              className="form-textarea"
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-proj-status" className="form-label">
              Status
            </label>
            <select
              id="edit-proj-status"
              className="form-select"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProject}>
              Delete Project Permanently
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" style={{ color: "var(--status-danger-text)" }} />
          <div style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Are you sure you want to delete <strong>{project.name}</strong>? This action will remove the project and its tasks. This cannot be undone.
          </div>
        </div>
      </Modal>

      {/* Task Creation/Editing Modal */}
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => {
          setCreateTaskOpen(false);
          setEditingTask(null);
        }}
        projects={[project]}
        initialProjectId={project.id}
        initialTask={editingTask}
        onTaskSaved={() => loadProjectData()}
      />

      {/* Document Creation Modal */}
      <CreateDocumentModal
        isOpen={createDocOpen}
        onClose={() => setCreateDocOpen(false)}
        projects={[project]}
        initialProjectId={project.id}
        onDocumentCreated={() => loadProjectData()}
      />
    </div>
  );
}
