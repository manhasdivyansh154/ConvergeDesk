import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  FileText,
  AlertCircle,
} from "lucide-react";
import Quill from "quill";
import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useAuth } from "../context/AuthContext";
import { documentsApi } from "../api/documents";
import { COLLAB_WS_URL } from "../api/client";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";

const USER_COLORS = [
  "#2563eb", // blue
  "#16a34a", // green
  "#d97706", // amber
  "#dc2626", // red
  "#9333ea", // purple
  "#0891b2", // cyan
];

export function DocumentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [document, setDocument] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Real-time Collaboration States
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // "connected" | "connecting" | "offline"
  const [collaborators, setCollaborators] = useState([]);
  const [serverNotice, setServerNotice] = useState(null);

  const editorContainerRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  const bindingRef = useRef(null);

  // Load document metadata first
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    documentsApi
      .get(id)
      .then((doc) => {
        if (!isMounted) return;
        setDocument(doc);
        setDocTitle(doc.title);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load document", err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Initialize Quill, Yjs, and HocuspocusProvider
  useEffect(() => {
    if (!document || !editorContainerRef.current) return;

    // Destroy any existing instances
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }

    // Clean editor container
    editorContainerRef.current.innerHTML = "";
    const editorDiv = window.document.createElement("div");
    editorContainerRef.current.appendChild(editorDiv);

    // Initialize Quill
    const quill = new Quill(editorDiv, {
      theme: "snow",
      placeholder: "Write specifications, requirements, architecture decisions...",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "clean"],
        ],
      },
    });
    quillInstanceRef.current = quill;

    // Initialize Yjs Doc
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const ytext = ydoc.getText("quill");

    // Connect to Hocuspocus collaboration server
    const roomName = `convergedesk-document-${id}`;
    const userColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];

    let provider = null;
    try {
      provider = new HocuspocusProvider({
        url: COLLAB_WS_URL,
        name: roomName,
        token: token || "demo-token",
        document: ydoc,
        onStatus: ({ status }) => {
          setConnectionStatus(status);
        },
        onSynced: ({ state }) => {
          if (state) {
            setLastSaved(new Date());
          }
        },
        onConnect: () => {
          setConnectionStatus("connected");
          setServerNotice(null);
        },
        onDisconnect: () => {
          setConnectionStatus("offline");
        },
        onClose: () => {
          setConnectionStatus("offline");
        },
        onAuthenticationFailed: () => {
          setConnectionStatus("offline");
          setServerNotice("Authentication failed on collaboration server. Running in local session mode.");
        },
      });

      // Awareness for cursor & collaborator presence
      if (provider.awareness) {
        provider.awareness.setLocalStateField("user", {
          name: user?.username || "Anonymous Dev",
          color: userColor,
        });

        provider.awareness.on("change", () => {
          const states = Array.from(provider.awareness.getStates().values());
          const activeUsers = states
            .filter((s) => s.user)
            .map((s) => s.user);
          setCollaborators(activeUsers);
        });
      }

      // Bind Quill to Yjs
      const binding = new QuillBinding(ytext, quill, provider.awareness);
      bindingRef.current = binding;
      providerRef.current = provider;
    } catch (e) {
      console.warn("Hocuspocus provider failed to start, falling back to local edit mode:", e);
      setConnectionStatus("offline");
    }

    // Set initial content if Yjs is empty
    setTimeout(() => {
      if (ytext.length === 0 && document.content) {
        quill.clipboard.dangerouslyPasteHTML(0, document.content);
      }
    }, 200);

    // Fallback: If after 3.5s connection is still connecting, declare offline mode gracefully
    const fallbackTimer = setTimeout(() => {
      setConnectionStatus((prev) => {
        if (prev === "connecting") {
          setServerNotice(
            "Collaboration server (ws://localhost:1234) is offline. Running in local session mode with auto-save."
          );
          return "offline";
        }
        return prev;
      });
    }, 3500);

    return () => {
      clearTimeout(fallbackTimer);
      if (bindingRef.current) bindingRef.current.destroy();
      if (providerRef.current) providerRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, [document, id, token, user]);

  // Save document handler
  const handleSaveDocument = async () => {
    if (!quillInstanceRef.current || !document) return;
    setSaving(true);
    try {
      const htmlContent = quillInstanceRef.current.root.innerHTML;
      await documentsApi.update(document.id, {
        title: docTitle.trim() || document.title,
        content: htmlContent,
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save document", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleBlur = async () => {
    if (!docTitle.trim() || docTitle === document?.title) return;
    try {
      await documentsApi.update(document.id, { title: docTitle.trim() });
    } catch (err) {
      console.error("Failed to update title", err);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingSpinner text="Connecting to collaborative document..." fullPage />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="page-wrapper">
        <EmptyState
          icon={FileText}
          title="Document not found"
          description="The requested document could not be found or you do not have permission to view it."
          actionLabel="Back to Documents"
          onAction={() => navigate("/documents")}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px)",
        backgroundColor: "var(--bg-app)",
      }}
    >
      {/* Editor Sub-Header Toolbar */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "260px" }}>
          <Link
            to="/documents"
            className="btn btn-ghost btn-sm"
            style={{ padding: "6px" }}
            title="Back to documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Untitled Document"
            style={{
              fontSize: "16px",
              fontWeight: 650,
              color: "var(--text-primary)",
              border: "1px solid transparent",
              borderRadius: "var(--radius-sm)",
              padding: "4px 8px",
              backgroundColor: "transparent",
              width: "100%",
              maxWidth: "520px",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--border-subtle)";
              e.target.style.backgroundColor = "var(--bg-surface-subtle)";
            }}
            onBlurCapture={(e) => {
              e.target.style.borderColor = "transparent";
              e.target.style.backgroundColor = "transparent";
            }}
          />
        </div>

        {/* Presence, Status Pill & Save Action */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Active Collaborators Presence Stack */}
          {collaborators.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Active:</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                {collaborators.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    title={c.name}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: c.color || "var(--primary)",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 600,
                      display: "grid",
                      placeItems: "center",
                      border: "2px solid #ffffff",
                      marginLeft: i > 0 ? "-6px" : "0",
                    }}
                  >
                    {c.name ? c.name[0].toUpperCase() : "U"}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connection Status Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              backgroundColor:
                connectionStatus === "connected"
                  ? "var(--status-success-bg)"
                  : connectionStatus === "connecting"
                  ? "var(--status-warning-bg)"
                  : "var(--bg-surface-subtle)",
              border: `1px solid ${
                connectionStatus === "connected"
                  ? "var(--status-success-border)"
                  : connectionStatus === "connecting"
                  ? "var(--status-warning-border)"
                  : "var(--border-subtle)"
              }`,
              color:
                connectionStatus === "connected"
                  ? "var(--status-success-text)"
                  : connectionStatus === "connecting"
                  ? "var(--status-warning-text)"
                  : "var(--text-muted)",
            }}
          >
            {connectionStatus === "connected" ? (
              <>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--status-success-text)",
                  }}
                />
                <span>Live Sync (Hocuspocus)</span>
              </>
            ) : connectionStatus === "connecting" ? (
              <>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--status-warning-text)",
                  }}
                />
                <span>Connecting to room...</span>
              </>
            ) : (
              <>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--text-muted)",
                  }}
                />
                <span>Local Session (Auto-saving)</span>
              </>
            )}
          </div>

          {/* Save Status & Button */}
          {lastSaved && (
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={Save}
            loading={saving}
            onClick={handleSaveDocument}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Notice if server is offline */}
      {serverNotice && (
        <div
          style={{
            padding: "8px 24px",
            fontSize: "12px",
            backgroundColor: "#fffbeb",
            borderBottom: "1px solid #fde68a",
            color: "#b45309",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{serverNotice}</span>
        </div>
      )}

      {/* Editor Canvas Area */}
      <div
        style={{
          flex: 1,
          padding: "20px 24px 32px",
          display: "flex",
          justifyContent: "center",
          overflowY: "auto",
        }}
      >
        <div
          className="quill-editor-wrapper"
          style={{
            maxWidth: "920px",
            width: "100%",
            boxShadow: "var(--shadow-sm)",
          }}
          ref={editorContainerRef}
        />
      </div>
    </div>
  );
}
