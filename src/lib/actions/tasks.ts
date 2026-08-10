"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validation";

export async function updateTaskStatus(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = updateTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    status: formData.get("status") || undefined,
  });
  if (!parsed.success) return;

  const task = await db.task.update({
    where: { id: parsed.data.taskId },
    data: { status: parsed.data.status },
  });

  await db.activityLog.create({
    data: {
      projectId: task.projectId,
      taskId: task.id,
      message: `Task "${task.title}" marked ${parsed.data.status}.`,
    },
  });

  revalidatePath(`/projects/${projectId || task.projectId}`);
}

export async function updateTaskDetails(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = updateTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    owner: formData.get("owner") || undefined,
    notes: formData.get("notes") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) return;

  await db.task.update({
    where: { id: parsed.data.taskId },
    data: {
      owner: parsed.data.owner,
      notes: parsed.data.notes,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function addManualTask(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "Production Info");
  if (!projectId || !title) return;

  await db.task.create({
    data: {
      projectId,
      title,
      category,
      aiSuggested: false,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}
