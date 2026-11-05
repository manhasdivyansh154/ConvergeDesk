import React from "react";

export function Badge({
  children,
  variant = "neutral",
  className = "",
}) {
  const variantClass = {
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    info: "badge-info",
    neutral: "badge-neutral",
  }[variant] || "badge-neutral";

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

// Helpers for specific model fields
export function TaskStatusBadge({ status }) {
  const config = {
    TODO: { label: "To Do", variant: "info" },
    IN_PROGRESS: { label: "In Progress", variant: "warning" },
    DONE: { label: "Done", variant: "success" },
  }[status] || { label: status, variant: "neutral" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function TaskPriorityBadge({ priority }) {
  const config = {
    HIGH: { label: "High Priority", variant: "danger" },
    MEDIUM: { label: "Medium", variant: "warning" },
    LOW: { label: "Low", variant: "neutral" },
  }[priority] || { label: priority, variant: "neutral" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ProjectStatusBadge({ status }) {
  const config = {
    ACTIVE: { label: "Active", variant: "success" },
    COMPLETED: { label: "Completed", variant: "info" },
    ON_HOLD: { label: "On Hold", variant: "neutral" },
  }[status] || { label: status, variant: "neutral" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function RoleBadge({ role }) {
  const config = {
    OWNER: { label: "Owner", variant: "info" },
    ADMIN: { label: "Admin", variant: "warning" },
    MEMBER: { label: "Member", variant: "neutral" },
  }[role] || { label: role, variant: "neutral" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
