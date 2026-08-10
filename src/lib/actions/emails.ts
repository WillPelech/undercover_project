"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createEmailDraft } from "@/lib/email-generation";
import { generateEmailSchema } from "@/lib/validation";

export async function generateEmailDraft(formData: FormData) {
  const parsed = generateEmailSchema.safeParse({
    projectId: formData.get("projectId"),
    templateSource: formData.get("templateSource"),
  });
  if (!parsed.success) return;

  await createEmailDraft(parsed.data.projectId, parsed.data.templateSource);

  revalidatePath(`/projects/${parsed.data.projectId}`);
}

export async function markEmailSent(formData: FormData) {
  const emailId = String(formData.get("emailId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  if (!emailId) return;

  await db.emailDraft.update({
    where: { id: emailId },
    data: { status: "marked_sent" },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteEmailDraft(formData: FormData) {
  const emailId = String(formData.get("emailId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  if (!emailId) return;

  await db.emailDraft.delete({ where: { id: emailId } });
  revalidatePath(`/projects/${projectId}`);
}
