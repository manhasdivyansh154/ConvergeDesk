import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  LogOut,
  Building2,
  Check,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

export function Navbar({ onToggleMobileSidebar, isMobileSidebarOpen }) {
  const { user, logout, isDemoMode } = useAuth();
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createWsOpen, setCreateWsOpen] = useState(false);

  const wsMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wsMenuRef.current && !wsMenuRef.current.contains(e.target)) {
        setWorkspaceMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      <header
        style={{
          height: "56px",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Mobile hamburger */}
          <button
            type="button"
            className="btn-ghost btn-icon-only lg-hidden"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle navigation menu"
            style={{ display: "none" }}
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 1px 3px rgba(29, 78, 216, 0.3)",
              }}
              aria-hidden="true"
            >
              <Layers className="w-4 h-4" />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "16px",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              ConvergeDesk
            </span>
          </div>

          <div
            style={{
              width: "1px",
              height: "20px",
              backgroundColor: "var(--border-subtle)",
              margin: "0 4px",
            }}
          />

          {/* Workspace Switcher Dropdown */}
          <div ref={wsMenuRef} style={{ position: "relative" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              aria-expanded={workspaceMenuOpen}
              aria-haspopup="true"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 550,
                maxWidth: "240px",
              }}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" style={{ color: "var(--text-muted)" }} />
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentWorkspace?.name || "Select Workspace"}
              </span>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
            </button>

            {workspaceMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "6px",
                  width: "260px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-md)",
                  padding: "6px",
                  zIndex: 50,
                }}
                role="menu"
              >
                <div
                  style={{
                    padding: "6px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--text-muted)",
                  }}
                >
                  Workspaces
                </div>

                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setWorkspaceMenuOpen(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        fontSize: "13px",
                        borderRadius: "var(--radius-sm)",
                        textAlign: "left",
                        backgroundColor:
                          currentWorkspace?.id === ws.id ? "var(--bg-surface-subtle)" : "transparent",
                        fontWeight: currentWorkspace?.id === ws.id ? 600 : 400,
                        color: "var(--text-primary)",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ws.name}
                      </span>
                      {currentWorkspace?.id === ws.id && (
                        <Check className="w-4 h-4 text-primary" style={{ color: "var(--primary)" }} />
                      )}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    height: "1px",
                    backgroundColor: "var(--border-subtle)",
                    margin: "6px 0",
                  }}
                />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setWorkspaceMenuOpen(false);
                    setCreateWsOpen(true);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    fontSize: "13px",
                    color: "var(--primary)",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 550,
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Status Pill & User Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Mode Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              fontSize: "11.5px",
              fontWeight: 500,
              backgroundColor: isDemoMode ? "var(--bg-surface-subtle)" : "var(--status-success-bg)",
              border: `1px solid ${isDemoMode ? "var(--border-subtle)" : "var(--status-success-border)"}`,
              color: isDemoMode ? "var(--text-secondary)" : "var(--status-success-text)",
            }}
            title={isDemoMode ? "Preview Demo Mode: backend offline" : "Connected to Django REST API"}
          >
            {isDemoMode ? (
              <>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--text-muted)",
                  }}
                />
                <span>Demo Preview</span>
              </>
            ) : (
              <>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--status-success-text)",
                  }}
                />
                <span>API Connected</span>
              </>
            )}
          </div>

          {/* User Profile dropdown */}
          <div ref={userMenuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                padding: "4px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {user?.username ? user.username.substring(0, 2).toUpperCase() : "U"}
              </div>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "6px",
                  width: "220px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-md)",
                  padding: "6px",
                  zIndex: 50,
                }}
                role="menu"
              >
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {user?.username || "Authenticated User"}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px" }}>
                    {user?.email || "user@convergedesk.local"}
                  </div>
                </div>

                <div
                  style={{
                    height: "1px",
                    backgroundColor: "var(--border-subtle)",
                    margin: "4px 0",
                  }}
                />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    fontSize: "13px",
                    color: "var(--status-danger-text)",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "left",
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <CreateWorkspaceModal isOpen={createWsOpen} onClose={() => setCreateWsOpen(false)} />
    </>
  );
}
