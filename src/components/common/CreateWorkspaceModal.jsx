import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useWorkspace } from "../../context/WorkspaceContext";

export function CreateWorkspaceModal({ isOpen, onClose }) {
  const { createWorkspace } = useWorkspace();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createWorkspace({
        name: name.trim(),
        slug: slug.trim() || undefined,
      });
      setName("");
      setSlug("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workspace"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Create Workspace
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
          <label htmlFor="ws-name" className="form-label">
            Workspace Name <span className="required-indicator">*</span>
          </label>
          <input
            id="ws-name"
            type="text"
            className="form-input"
            placeholder="e.g. Acme Core Team"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) {
                // auto-suggest slug
                // leave blank or let user fill
              }
            }}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="ws-slug" className="form-label">
            Workspace URL Slug <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>(Optional)</span>
          </label>
          <input
            id="ws-slug"
            type="text"
            className="form-input"
            placeholder="e.g. acme-core-team"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <span className="form-hint">
            Alphanumeric characters and hyphens only. If left empty, one will be generated automatically.
          </span>
        </div>
      </form>
    </Modal>
  );
}

