import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FolderGit2,
  Plus,
  Search,
  FileText,
  User,
  ArrowRight,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { projectsApi } from "../api/projects";
import { tasksApi } from "../api/tasks";
import { documentsApi } from "../api/documents";
import { Button } from "../components/common/Button";
import { ProjectStatusBadge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { CreateProjectModal } from "../components/projects/CreateProjectModal";

export function ProjectsPage() {
  const { currentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const [pList, tList, dList] = await Promise.all([
        projectsApi.list(currentWorkspace.id),
        tasksApi.list({ workspaceId: currentWorkspace.id }),
        documentsApi.listByWorkspace(currentWorkspace.id),
      ]);
      setProjects(pList);
      setTasks(tList);
      setDocuments(dList);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-title-group">
          <h1>Projects</h1>
          <p className="page-subtitle">
            Manage engineering initiatives, task progress, and related architecture documents
          </p>
        </div>

        <div className="page-header-actions">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="surface-card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "240px", maxWidth: "400px" }}>
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
            placeholder="Search projects by name or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginRight: "4px" }}>Status:</span>
          {["ALL", "ACTIVE", "COMPLETED", "ON_HOLD"].map((status) => (
            <button
              key={status}
              type="button"
              className={`btn btn-sm ${statusFilter === status ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setStatusFilter(status)}
              style={{ padding: "4px 10px", fontSize: "12px" }}
            >
              {status === "ALL" ? "All" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading projects..." fullPage />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={searchQuery || statusFilter !== "ALL" ? "No matching projects found" : "No projects in this workspace"}
          description={
            searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your search terms or status filters."
              : "Create your team's first project to start organizing tasks, code milestones, and specifications."
          }
          actionLabel={searchQuery || statusFilter !== "ALL" ? "Clear Filters" : "Create Project"}
          onAction={
            searchQuery || statusFilter !== "ALL"
              ? () => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }
              : () => setCreateModalOpen(true)}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.project === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === "DONE");
            const projectDocs = documents.filter((d) => d.project === project.id);
            const progress = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;

            return (
              <div
                key={project.id}
                className="surface-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                    <Link
                      to={`/projects/${project.id}`}
                      style={{
                        fontSize: "15px",
                        fontWeight: 650,
                        color: "var(--text-primary)",
                        lineHeight: 1.3,
                      }}
                    >
                      {project.name}
                    </Link>
                    <ProjectStatusBadge status={project.status} />
                  </div>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      marginBottom: "16px",
                      minHeight: "38px",
                    }}
                  >
                    {project.description || "No description provided for this project."}
                  </p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <span>Task Progress</span>
                      <span>{doneTasks.length}/{projectTasks.length} Done ({progress}%)</span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "var(--border-subtle)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          backgroundColor: progress === 100 ? "var(--status-success-text)" : "var(--primary)",
                          borderRadius: "var(--radius-full)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Metadata & Open link */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--border-subtle)",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <FileText className="w-3.5 h-3.5" />
                        {projectDocs.length} docs
                      </span>
                      {project.created_by_username && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <User className="w-3.5 h-3.5" />
                          @{project.created_by_username}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/projects/${project.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={() => loadData()}
      />
    </div>
  );
}
