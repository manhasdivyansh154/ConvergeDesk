import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useWorkspace } from "../../context/WorkspaceContext";
import { projectsApi } from "../../api/projects";

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const { currentWorkspace } = useWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!currentWorkspace?.id) {
      setError("Please select or create a workspace first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await projectsApi.create({
        workspace: currentWorkspace.id,
        name: name.trim(),
        description: description.trim(),
        status,
      });
      setName("");
      setDescription("");
      setStatus("ACTIVE");
      if (onProjectCreated) onProjectCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Create Project
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
          <label className="form-label">
            Target Workspace
          </label>
          <input
            type="text"
            className="form-input"
            value={currentWorkspace?.name || ""}
            disabled
            style={{ backgroundColor: "var(--bg-surface-subtle)", color: "var(--text-secondary)" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="proj-name" className="form-label">
            Project Name <span className="required-indicator">*</span>
          </label>
          <input
            id="proj-name"
            type="text"
            className="form-input"
            placeholder="e.g. Distributed Tracing & OpenTelemetry"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="proj-desc" className="form-label">
            Description
          </label>
          <textarea
            id="proj-desc"
            className="form-textarea"
            rows={3}
            placeholder="Key objectives, scope, or delivery milestones..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="proj-status" className="form-label">
            Initial Status
          </label>
          <select
            id="proj-status"
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}

