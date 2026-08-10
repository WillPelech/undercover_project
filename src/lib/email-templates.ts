import type { Company, Project } from "@/generated/prisma/client";
import type { EmailTemplateSource } from "@/lib/constants";

/**
 * Static fallback templates, tone/structure lifted directly from the a16z
 * Portco Video Engagement Playbook (structured, opinionated-but-flexible,
 * clear asks). Used when no ANTHROPIC_API_KEY is configured, or if the AI
 * call fails, so email drafting always works.
 */
export function fallbackEmailTemplate(
  source: EmailTemplateSource,
  project: Project & { company: Company }
): { subject: string; body: string } {
  const shootDate = project.targetShootDate
    ? project.targetShootDate.toLocaleDateString()
    : "[Date TBD]";
  const deliveryDate = project.targetDeliveryDate
    ? project.targetDeliveryDate.toLocaleDateString()
    : "[Date TBD]";

  if (source === "kickoff") {
    return {
      subject: `${project.name} — Kickoff & Timeline`,
      body: `Hi [Name],

Excited to get ${project.name} moving.

Here's the working timeline:

- Shoot window: ${shootDate}
- Final delivery: ${deliveryDate}

We'll keep things moving quickly between each step and flag anything that could impact timing.

Best,
[Your Name]`,
    };
  }

  if (source === "status_update") {
    return {
      subject: `${project.name} — Status Update`,
      body: `Hi [Name],

Quick update on ${project.name}:

- Current stage: ${project.status}
- Next milestone: [fill in]

Let us know if anything looks off, and we'll keep you posted as things progress.

Best,
[Your Name]`,
    };
  }

  return {
    subject: `${project.name} — Quick Nudge`,
    body: `Hi [Name],

Following up on a few open items for ${project.name} so we can stay on schedule for ${shootDate}.

Could you take a look when you get a chance? Happy to hop on a call if anything's unclear.

Best,
[Your Name]`,
  };
}
