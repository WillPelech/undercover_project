import { db } from "@/lib/db";
import type { Project } from "@/generated/prisma/client";

/**
 * Condition mini-language stored as JSON on TaskTemplate.conditions.
 * All keys in a condition object are AND'd together; an empty object always
 * matches (i.e. the task applies to every project).
 *
 *   { "shootMode": "in-person" }                       -> equality
 *   { "shootModeIn": ["in-person", "hybrid"] }         -> membership
 *   { "crewSizeEstimateGte": 10 }                      -> numeric >=
 *   { "flag": "hasStunts" }                            -> boolean field is true
 *   { "flagFalse": "hasMinors" }                       -> boolean field is false
 *   { "flagAnyOf": ["hasMinors", "hasStunts"] }        -> any listed boolean field is true
 *
 * This is intentionally small. Phase 2 (compliance moat) will lean on
 * flag/flagAnyOf heavily to mirror the NYU "Special Scenes" trigger sections.
 */
export type TemplateConditions = {
  format?: string;
  formatIn?: string[];
  shootMode?: string;
  shootModeIn?: string[];
  budgetTier?: string;
  budgetTierIn?: string[];
  crewSizeEstimateGte?: number;
  crewSizeEstimateLte?: number;
  flag?: keyof Project;
  flagFalse?: keyof Project;
  flagAnyOf?: (keyof Project)[];
};

export function parseConditions(raw: string): TemplateConditions {
  try {
    return JSON.parse(raw) as TemplateConditions;
  } catch {
    return {};
  }
}

export function matchesConditions(
  project: Project,
  conditions: TemplateConditions
): boolean {
  if (conditions.format && project.format !== conditions.format) return false;
  if (conditions.formatIn && !conditions.formatIn.includes(project.format))
    return false;

  if (conditions.shootMode && project.shootMode !== conditions.shootMode)
    return false;
  if (
    conditions.shootModeIn &&
    !conditions.shootModeIn.includes(project.shootMode)
  )
    return false;

  if (conditions.budgetTier && project.budgetTier !== conditions.budgetTier)
    return false;
  if (
    conditions.budgetTierIn &&
    !conditions.budgetTierIn.includes(project.budgetTier)
  )
    return false;

  if (
    conditions.crewSizeEstimateGte !== undefined &&
    (project.crewSizeEstimate ?? 0) < conditions.crewSizeEstimateGte
  )
    return false;
  if (
    conditions.crewSizeEstimateLte !== undefined &&
    (project.crewSizeEstimate ?? Infinity) > conditions.crewSizeEstimateLte
  )
    return false;

  if (conditions.flag && !project[conditions.flag]) return false;
  if (conditions.flagFalse && project[conditions.flagFalse]) return false;
  if (
    conditions.flagAnyOf &&
    !conditions.flagAnyOf.some((key) => Boolean(project[key]))
  )
    return false;

  return true;
}

/** Days before targetShootDate a task is due. Negative = after the shoot. */
function computeDueDate(
  targetShootDate: Date | null,
  dueOffsetDays: number
): Date | null {
  if (!targetShootDate) return null;
  const due = new Date(targetShootDate);
  due.setDate(due.getDate() - dueOffsetDays);
  return due;
}

/**
 * Matches every TaskTemplate against a Project's attributes and materializes
 * the matching ones as Task rows. Safe to call once, right after project
 * creation (intake wizard). Tasks are marked aiSuggested so the UI clearly
 * labels generated tasks as suggestions rather than mandates.
 */
export async function generateTasksForProject(projectId: string) {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
  });

  const templates = await db.taskTemplate.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const matched = templates.filter((t) =>
    matchesConditions(project, parseConditions(t.conditions))
  );

  if (matched.length === 0) return { created: 0 };

  await db.task.createMany({
    data: matched.map((t) => ({
      projectId: project.id,
      templateId: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      dueDate: computeDueDate(project.targetShootDate, t.dueOffsetDays),
      aiSuggested: true,
    })),
  });

  await db.activityLog.create({
    data: {
      projectId: project.id,
      message: `Generated ${matched.length} suggested tasks from the template library based on project intake answers.`,
    },
  });

  return { created: matched.length };
}
