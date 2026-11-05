import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Circle,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  User,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { tasksApi } from "../api/tasks";
import { projectsApi } from "../api/projects";
import { Button } from "../components/common/Button";
import { TaskPriorityBadge, TaskStatusBadge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { CreateTaskModal } from "../components/tasks/CreateTaskModal";

export function TasksPage() {
  const { currentWorkspace, members } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [viewMode, setViewMode] = useState("board"); // "board" | "list"
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const loadData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const [tList, pList] = await Promise.all([
        tasksApi.list({ workspaceId: currentWorkspace.id }),
        projectsApi.list(currentWorkspace.id),
      ]);
      setTasks(tList);
      setProjects(pList);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle task status transitions
  const handleUpdateStatus = async (task, newStatus) => {
    if (task.status === newStatus) return;
    try {
      const updated = await tasksApi.update(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await tasksApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProject = projectFilter === "ALL" || t.project === Number(projectFilter);
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === "ALL" ||
      (assigneeFilter === "UNASSIGNED" ? !t.assigned_to : t.assigned_to === Number(assigneeFilter));

    return matchesSearch && matchesProject && matchesPriority && matchesAssignee;
  });

  const columns = [
    { key: "TODO", label: "To Do", icon: Circle, color: "var(--status-info-text)" },
    { key: "IN_PROGRESS", label: "In Progress", icon: Clock, color: "var(--status-warning-text)" },
    { key: "DONE", label: "Done", icon: CheckCircle2, color: "var(--status-success-text)" },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-title-group">
          <h1>Tasks</h1>
          <p className="page-subtitle">
            Sprint backlog, task assignment, priorities, and workflow progress
          </p>
        </div>

        <div className="page-header-actions">
          {/* View Toggle */}
          <div
            style={{
              display: "flex",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`btn btn-sm ${viewMode === "board" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: 0 }}
              title="Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: 0 }}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingTask(null);
              setCreateModalOpen(true);
            }}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="surface-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "340px" }}>
          <Search
            className="w-4 h-4 text-slate-400"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="search"
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Project Filter */}
        <select
          className="form-select"
          style={{ width: "auto", minWidth: "160px" }}
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="ALL">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          className="form-select"
          style={{ width: "auto", minWidth: "140px" }}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>

        {/* Assignee Filter */}
        <select
          className="form-select"
          style={{ width: "auto", minWidth: "150px" }}
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="ALL">All Assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.user}>
              @{m.username}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading tasks..." fullPage />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={searchQuery || projectFilter !== "ALL" ? "No matching tasks found" : "No tasks in this workspace"}
          description={
            searchQuery || projectFilter !== "ALL"
              ? "Try adjusting your filter options."
              : "Create a task to break down projects into actionable deliverables."
          }
          actionLabel="Create Task"
          onAction={() => {
            setEditingTask(null);
            setCreateModalOpen(true);
          }}
        />
      ) : viewMode === "board" ? (
        /* Kanban Board View */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            const Icon = col.icon;

            return (
              <div
                key={col.key}
                style={{
                  backgroundColor: "var(--bg-surface-subtle)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 260px)",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icon className="w-4 h-4" style={{ color: col.color }} />
                    <span style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)" }}>
                      {col.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--bg-surface-subtle)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Tasks */}
                <div
                  style={{
                    padding: "12px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        padding: "28px 12px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        border: "1px dashed var(--border-medium)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      No tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const project = projects.find((p) => p.id === task.project);

                      return (
                        <div
                          key={task.id}
                          className="surface-card"
                          style={{
                            padding: "14px",
                            borderRadius: "var(--radius-sm)",
                            boxShadow: "var(--shadow-xs)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--primary)" }}>
                              {project?.name || "Project"}
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                type="button"
                                className="btn-ghost"
                                style={{ padding: "2px 4px" }}
                                onClick={() => {
                                  setEditingTask(task);
                                  setCreateModalOpen(true);
                                }}
                                title="Edit task"
                              >
                                <Edit2 className="w-3 h-3 text-slate-500" />
                              </button>
                              <button
                                type="button"
                                className="btn-ghost"
                                style={{ padding: "2px 4px", color: "var(--status-danger-text)" }}
                                onClick={() => handleDeleteTask(task.id)}
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h3
                            style={{
                              fontSize: "13.5px",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              marginBottom: "6px",
                              lineHeight: 1.35,
                            }}
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p
                              style={{
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                marginBottom: "10px",
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {task.description}
                            </p>
                          )}

                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                            <TaskPriorityBadge priority={task.priority} />
                            {task.due_date && (
                              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <Calendar className="w-3 h-3" />
                                {task.due_date}
                              </span>
                            )}
                            {task.assigned_to_username && (
                              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <User className="w-3 h-3" />
                                @{task.assigned_to_username}
                              </span>
                            )}
                          </div>

                          {/* Action moves */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              paddingTop: "8px",
                              borderTop: "1px solid var(--border-subtle)",
                              fontSize: "11.5px",
                            }}
                          >
                            {col.key !== "TODO" ? (
                              <button
                                type="button"
                                className="btn-ghost btn-sm"
                                style={{ padding: "2px 6px", fontSize: "11px" }}
                                onClick={() =>
                                  handleUpdateStatus(task, col.key === "DONE" ? "IN_PROGRESS" : "TODO")
                                }
                              >
                                <ArrowLeft className="w-3 h-3" />
                                <span>{col.key === "DONE" ? "In Progress" : "To Do"}</span>
                              </button>
                            ) : (
                              <span />
                            )}

                            {col.key !== "DONE" && (
                              <button
                                type="button"
                                className="btn-ghost btn-sm"
                                style={{ padding: "2px 6px", fontSize: "11px" }}
                                onClick={() =>
                                  handleUpdateStatus(task, col.key === "TODO" ? "IN_PROGRESS" : "DONE")
                                }
                              >
                                <span>{col.key === "TODO" ? "Start" : "Done"}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="surface-card" style={{ padding: "8px 16px" }}>
          {filteredTasks.map((task, idx) => {
            const project = projects.find((p) => p.id === task.project);

            return (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 6px",
                  borderBottom: idx < filteredTasks.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: 0 }}>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(
                        task,
                        task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO"
                      )
                    }
                    title="Toggle Status"
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
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
                      <span
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 550,
                          color: task.status === "DONE" ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: task.status === "DONE" ? "line-through" : "none",
                        }}
                      >
                        {task.title}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        in <strong>{project?.name || "Project"}</strong>
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "11px", color: "var(--text-muted)" }}>
                      <TaskPriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                      {task.due_date && <span>Due: {task.due_date}</span>}
                      {task.assigned_to_username && <span>Assignee: @{task.assigned_to_username}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() => {
                      setEditingTask(task);
                      setCreateModalOpen(true);
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
            );
          })}
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingTask(null);
        }}
        projects={projects}
        initialTask={editingTask}
        onTaskSaved={() => loadData()}
      />
    </div>
  );
}
