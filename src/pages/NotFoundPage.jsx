import { FileQuestion, ArrowLeft } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";

export function NotFoundPage() {
  return (
    <div className="page-wrapper" style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <EmptyState
        icon={FileQuestion}
        title="Page not found (404)"
        description="The view or resource you are trying to reach does not exist in this workspace."
        actionLabel="Back to Overview"
        actionIcon={ArrowLeft}
        onAction={() => window.location.assign("/")}
      />
    </div>
  );
}
