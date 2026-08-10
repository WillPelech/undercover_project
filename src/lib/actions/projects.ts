"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { generateTasksForProject } from "@/lib/rules-engine";
import { createProjectSchema, updateProjectStatusSchema } from "@/lib/validation";

// <input type="date"> gives "YYYY-MM-DD". Parsing that directly with
// `new Date(...)` treats it as UTC midnight, which then renders as the
// previous day in any timezone behind UTC. Appending a local time-of-day
// forces the browser/Node Date parser to use local time instead.
function toDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createProject(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = createProjectSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      `Invalid project intake data: ${parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`
    );
  }
  const data = parsed.data;

  const company = await db.company.upsert({
    where: { name: data.companyName },
    update: {},
    create: { name: data.companyName },
  });

  const project = await db.project.create({
    data: {
      name: data.name,
      companyId: company.id,
      format: data.format,
      budgetTier: data.budgetTier,
      shootMode: data.shootMode,
      locationText: data.locationText || null,
      crewSizeEstimate: data.crewSizeEstimate ?? null,
      targetShootDate: toDate(data.targetShootDate),
      targetDeliveryDate: toDate(data.targetDeliveryDate),
      hasStunts: Boolean(data.hasStunts),
      hasWeapons: Boolean(data.hasWeapons),
      hasMinors: Boolean(data.hasMinors),
      hasNudity: Boolean(data.hasNudity),
      hasAnimals: Boolean(data.hasAnimals),
      hasVehicles: Boolean(data.hasVehicles),
      hasWaterOrRain: Boolean(data.hasWaterOrRain),
      hasHeights: Boolean(data.hasHeights),
      hasFireOrPyro: Boolean(data.hasFireOrPyro),
    },
  });

  await generateTasksForProject(project.id);

  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function updateProjectStatus(formData: FormData) {
  const parsed = updateProjectStatusSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) return;

  await db.project.update({
    where: { id: parsed.data.projectId },
    data: { status: parsed.data.status },
  });

  await db.activityLog.create({
    data: {
      projectId: parsed.data.projectId,
      message: `Project status changed to "${parsed.data.status}".`,
    },
  });

  revalidatePath("/");
  revalidatePath(`/projects/${parsed.data.projectId}`);
}
