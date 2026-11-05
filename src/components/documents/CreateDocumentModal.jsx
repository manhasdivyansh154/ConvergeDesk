import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { documentsApi } from "../../api/documents";

export function CreateDocumentModal({
  isOpen,
  onClose,
  projects = [],
  initialProjectId = null,
  onDocumentCreated,
}) {
  const [projectId, setProjectId] = useState(initialProjectId || (projects[0]?.id || ""));
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Document title is required.");
      return;
    }
    const targetProjId = initialProjectId || projectId;
    if (!targetProjId) {
      setError("Please select a project for this document.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await documentsApi.create(targetProjId, {
        title: title.trim(),
        content: `<h1>${title.trim()}</h1><p>Start collaborating with your team in real time...</p>`,
      });
      setTitle("");
      if (onDocumentCreated) onDocumentCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Shared Document"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            Create Document
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

        {!initialProjectId && (
          <div className="form-group">
            <label htmlFor="doc-project" className="form-label">
              Project <span className="required-indicator">*</span>
            </label>
            <select
              id="doc-project"
              className="form-select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="" disabled>Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="doc-title" className="form-label">
            Document Title <span className="required-indicator">*</span>
          </label>
          <input
            id="doc-title"
            type="text"
            className="form-input"
            placeholder="e.g. Architecture RFC: Real-time Event Streaming"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>
      </form>
    </Modal>
  );
}

