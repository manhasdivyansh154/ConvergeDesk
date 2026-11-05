import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  FileEdit,
  Trash2,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { documentsApi } from "../api/documents";
import { projectsApi } from "../api/projects";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { CreateDocumentModal } from "../components/documents/CreateDocumentModal";

export function DocumentsPage() {
  const { currentWorkspace } = useWorkspace();
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const [dList, pList] = await Promise.all([
        documentsApi.listByWorkspace(currentWorkspace.id),
        projectsApi.list(currentWorkspace.id),
      ]);
      setDocuments(dList);
      setProjects(pList);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteDoc = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await documentsApi.delete(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err.message || "Failed to delete document");
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === "ALL" || doc.project === Number(projectFilter);
    return matchesSearch && matchesProject;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-title-group">
          <h1>Shared Documents</h1>
          <p className="page-subtitle">
            Collaborative technical specifications, RFCs, and engineering playbooks
          </p>
        </div>

        <div className="page-header-actions">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            New Document
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "380px" }}>
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
            placeholder="Search documents by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "180px" }}
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
      </div>

      {loading ? (
        <LoadingSpinner text="Loading documents..." fullPage />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchQuery || projectFilter !== "ALL" ? "No matching documents found" : "No documents created yet"}
          description={
            searchQuery || projectFilter !== "ALL"
              ? "Try adjusting your search query or project filter."
              : "Create technical documents that your engineering team can edit together in real time."
          }
          actionLabel="Create Document"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredDocs.map((doc) => {
            const project = projects.find((p) => p.id === doc.project);

            return (
              <div
                key={doc.id}
                className="surface-card"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--primary)" }}>
                      {project?.name || "Project"}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id, doc.title)}
                      className="btn-ghost btn-sm"
                      style={{ color: "var(--status-danger-text)", padding: "4px" }}
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link
                    to={`/documents/${doc.id}/edit`}
                    style={{
                      fontSize: "15px",
                      fontWeight: 650,
                      color: "var(--text-primary)",
                      display: "block",
                      marginBottom: "6px",
                      lineHeight: 1.35,
                    }}
                  >
                    {doc.title}
                  </Link>

                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Author: @{doc.created_by_username || "team"}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    Yjs CRDT Enabled
                  </span>

                  <Link
                    to={`/documents/${doc.id}/edit`}
                    className="btn btn-primary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Open Editor</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateDocumentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        projects={projects}
        onDocumentCreated={() => loadData()}
      />
    </div>
  );
}
