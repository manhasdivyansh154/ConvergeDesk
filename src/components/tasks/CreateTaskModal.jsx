import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useWorkspace } from "../../context/WorkspaceContext";
import { tasksApi } from "../../api/tasks";

export function CreateTaskModal({
  isOpen,
  onClose,
  projects = [],
  initialProjectId = null,
  initialTask = null,
  onTaskSaved,
}) {
  const { members } = useWorkspace();
  const [projectId, setProjectId] = useState(initialProjectId || (projects[0]?.id || ""));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialTask) {
      setProjectId(initialTask.project);
      setTitle(initialTask.title || "");
      setDescription(initialTask.description || "");
      setStatus(initialTask.status || "TODO");
      setPriority(initialTask.priority || "MEDIUM");
      setAssignedTo(initialTask.assigned_to || "");
      setDueDate(initialTask.due_date || "");
    } else {
      setProjectId(initialProjectId || (projects[0]?.id || ""));
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setAssignedTo("");
      setDueDate("");
    }
    setError(null);
  }, [initialTask, initialProjectId, projects, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (!projectId) {
      setError("Please select a project for this task.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      project: Number(projectId),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigned_to: assignedTo ? Number(assignedTo) : null,
      due_date: dueDate || null,
    };

    try {
      let saved;
      if (initialTask?.id) {
        saved = await tasksApi.update(initialTask.id, payload);
      } else {
        saved = await tasksApi.create(payload);
      }
      if (onTaskSaved) onTaskSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? "Edit Task" : "Create New Task"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            {initialTask ? "Save Changes" : "Create Task"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
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

        <div className="form-group">
          <label htmlFor="task-project" className="form-label">
            Project <span className="required-indicator">*</span>
          </label>
          <select
            id="task-project"
            className="form-select"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            disabled={Boolean(initialProjectId && !initialTask)}
          >
            <option value="" disabled>Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Task Title <span className="required-indicator">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            placeholder="e.g. Implement Lua filter for token validation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-desc" className="form-label">
            Description
          </label>
          <textarea
            id="task-desc"
            className="form-textarea"
            rows={3}
            placeholder="Technical details, acceptance criteria, dependencies..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label htmlFor="task-status" className="form-label">
              Status
            </label>
            <select
              id="task-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-priority" className="form-label">
              Priority
            </label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label htmlFor="task-assignee" className="form-label">
              Assignee
            </label>
            <select
              id="task-assignee"
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.user}>
                  {m.username} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-duedate" className="form-label">
              Due Date
            </label>
            <input
              id="task-duedate"
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

