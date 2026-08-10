// Central source of truth for the string-typed "enum" fields (SQLite has no
// native enum support locally; Postgres/Neon in production could promote
// these to real enums if desired).

export const PROJECT_FORMATS = [
  "commercial",
  "branded",
  "talking-head",
  "narrative",
  "docu-style",
] as const;
export type ProjectFormat = (typeof PROJECT_FORMATS)[number];

export const BUDGET_TIERS = ["small", "medium", "large"] as const;
export type BudgetTier = (typeof BUDGET_TIERS)[number];

export const SHOOT_MODES = ["in-person", "remote", "hybrid"] as const;
export type ShootMode = (typeof SHOOT_MODES)[number];

export const PROJECT_STATUSES = [
  "intake",
  "pre-production",
  "production",
  "post-production",
  "delivered",
  "archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TASK_STATUSES = [
  "not_started",
  "in_progress",
  "ready_for_review",
  "complete",
  "n_a",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_CATEGORIES = [
  "Production Info",
  "Crew",
  "Locations",
  "Legal & Insurance",
  "Equipment & Rentals",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const EMAIL_TEMPLATE_SOURCES = [
  "kickoff",
  "status_update",
  "nudge",
] as const;
export type EmailTemplateSource = (typeof EMAIL_TEMPLATE_SOURCES)[number];

export const FORM_STATUSES = ["not_sent", "sent", "completed"] as const;
export type FormStatus = (typeof FORM_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  ready_for_review: "Ready for Review",
  complete: "Complete",
  n_a: "N/A",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  intake: "Intake",
  "pre-production": "Pre-Production",
  production: "Production",
  "post-production": "Post-Production",
  delivered: "Delivered",
  archived: "Archived",
};
