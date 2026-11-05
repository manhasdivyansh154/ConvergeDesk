import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  FileText,
  Users,
  Shield,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { RoleBadge } from "./Badge";

export function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { currentWorkspace, userRole } = useWorkspace();

  const navItems = [
    { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/projects", label: "Projects", icon: FolderGit2 },
    { to: "/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/documents", label: "Documents", icon: FileText },
    { to: "/members", label: "Team & Invites", icon: Users },
  ];

  return (
    <aside
      className={`sidebar-container ${isMobileOpen ? "mobile-open" : ""}`}
      style={{
        width: "230px",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "calc(100vh - 56px)",
        position: "sticky",
        top: "56px",
      }}
    >
      {/* Workspace Header Details */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 600 }}>
          Current Workspace
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 650,
            color: "var(--text-primary)",
            marginTop: "3px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={currentWorkspace?.name}
        >
          {currentWorkspace?.name || "No workspace selected"}
        </div>
        <div style={{ marginTop: "6px" }}>
          <RoleBadge role={userRole} />
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
        }}
        aria-label="Workspace navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--primary-subtle)" : "transparent",
                transition: "all var(--transition-fast)",
              })}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "11px",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Shield className="w-3.5 h-3.5" />
        <span>ConvergeDesk v1.0.0</span>
      </div>
    </aside>
  );
}
