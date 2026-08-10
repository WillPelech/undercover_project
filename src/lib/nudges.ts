import { db } from "@/lib/db";
import { createEmailDraft } from "@/lib/email-generation";

const RENUDGE_COOLDOWN_HOURS = 24;

/**
 * Scans for projects with overdue, not-done tasks and generates a draft
 * nudge email for each one that doesn't already have a recent, un-actioned
 * nudge draft sitting in the review queue (avoids spamming the queue every
 * time the cron runs). Never sends anything — only ever creates `draft` rows
 * for a human to review and send.
 */
export async function generateOverdueNudges() {
  const now = new Date();

  const overdueTasks = await db.task.findMany({
    where: {
      dueDate: { lt: now },
      status: { notIn: ["complete", "n_a"] },
      project: { status: { notIn: ["delivered", "archived"] } },
    },
    select: { projectId: true },
    distinct: ["projectId"],
  });

  const cooldownCutoff = new Date(
    now.getTime() - RENUDGE_COOLDOWN_HOURS * 60 * 60 * 1000
  );

  let created = 0;
  for (const { projectId } of overdueTasks) {
    const recentNudge = await db.emailDraft.findFirst({
      where: {
        projectId,
        templateSource: "nudge",
        status: "draft",
        createdAt: { gt: cooldownCutoff },
      },
    });
    if (recentNudge) continue;

    await createEmailDraft(projectId, "nudge");
    created += 1;
  }

  return { scannedProjects: overdueTasks.length, draftsCreated: created };
}
