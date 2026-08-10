import { db } from "@/lib/db";
import { draftEmailWithAI } from "@/lib/anthropic";
import { fallbackEmailTemplate } from "@/lib/email-templates";
import type { EmailTemplateSource } from "@/lib/constants";

export async function loadProjectForEmail(projectId: string) {
  return db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { company: true, tasks: true },
  });
}

type ProjectForEmail = Awaited<ReturnType<typeof loadProjectForEmail>>;

export function buildEmailPrompt(
  source: EmailTemplateSource,
  project: ProjectForEmail
) {
  const overdue = project.tasks.filter(
    (t) =>
      t.status !== "complete" &&
      t.status !== "n_a" &&
      t.dueDate &&
      t.dueDate < new Date()
  );
  const upcoming = project.tasks
    .filter((t) => t.status !== "complete" && t.status !== "n_a")
    .slice(0, 6);

  const context = `Project: ${project.name}
Company: ${project.company.name}
Format: ${project.format}
Shoot mode: ${project.shootMode}
Status: ${project.status}
Target shoot date: ${project.targetShootDate?.toDateString() ?? "TBD"}
Target delivery date: ${project.targetDeliveryDate?.toDateString() ?? "TBD"}
Overdue open tasks: ${overdue.map((t) => t.title).join("; ") || "none"}
Upcoming open tasks: ${upcoming.map((t) => t.title).join("; ") || "none"}`;

  if (source === "kickoff") {
    return `Draft a kickoff email for this project, sharing the working timeline and setting expectations.\n\n${context}`;
  }
  if (source === "status_update") {
    return `Draft a brief status-update email for this project summarizing progress and next milestone.\n\n${context}`;
  }
  return `Draft a friendly but direct nudge email about the overdue/open items below so the project stays on schedule.\n\n${context}`;
}

/**
 * Generates (AI, with static-template fallback) and persists a draft email
 * for a project. Always lands as a `draft` EmailDraft row — never sent
 * automatically, per the "draft-only, human sends" policy.
 */
export async function createEmailDraft(
  projectId: string,
  source: EmailTemplateSource
) {
  const project = await loadProjectForEmail(projectId);
  const prompt = buildEmailPrompt(source, project);

  const aiResult = await draftEmailWithAI(prompt);
  const { subject, body } = aiResult ?? fallbackEmailTemplate(source, project);

  return db.emailDraft.create({
    data: {
      projectId: project.id,
      templateSource: source,
      subject,
      body,
      status: "draft",
    },
  });
}
