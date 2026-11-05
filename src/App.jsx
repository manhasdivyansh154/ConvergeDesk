import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

// Eagerly loaded critical first-screen pages
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";

// Code-split / lazy-loaded secondary routes for optimal bundle size and first-contentful-paint
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const AcceptInvitationPage = lazy(() =>
  import("./pages/AcceptInvitationPage").then((m) => ({ default: m.AcceptInvitationPage }))
);
const ProjectsPage = lazy(() =>
  import("./pages/ProjectsPage").then((m) => ({ default: m.ProjectsPage }))
);
const ProjectDetailPage = lazy(() =>
  import("./pages/ProjectDetailPage").then((m) => ({ default: m.ProjectDetailPage }))
);
const TasksPage = lazy(() =>
  import("./pages/TasksPage").then((m) => ({ default: m.TasksPage }))
);
const DocumentsPage = lazy(() =>
  import("./pages/DocumentsPage").then((m) => ({ default: m.DocumentsPage }))
);
const DocumentEditorPage = lazy(() =>
  import("./pages/DocumentEditorPage").then((m) => ({ default: m.DocumentEditorPage }))
);
const MembersPage = lazy(() =>
  import("./pages/MembersPage").then((m) => ({ default: m.MembersPage }))
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function SuspenseFallback() {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <LoadingSpinner text="Loading view..." />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />

              {/* Protected Workspace Routes inside AppLayout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/documents/:id/edit" element={<DocumentEditorPage />} />
                  <Route path="/members" element={<MembersPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
