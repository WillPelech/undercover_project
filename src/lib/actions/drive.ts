"use server";

import { google } from "googleapis";
import { db } from "@/lib/db";
import { TASK_CATEGORIES } from "@/lib/constants";

function isDriveConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
  );
}

function getDriveClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Service account keys are usually stored with literal "\n" sequences in
    // env vars; convert back to real newlines.
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

/**
 * Exports a project's task list as a real Google Drive folder tree: one
 * top-level folder per project, one subfolder per task category, and a
 * summary Google Doc with the full checklist. This is a one-shot export/
 * snapshot for backup and handoff, not a live two-way sync.
 */
export async function exportProjectToDrive(
  projectId: string
): Promise<{ ok: boolean; message: string; folderUrl?: string }> {
  if (!isDriveConfigured()) {
    return {
      ok: false,
      message:
        "Google Drive export isn't configured yet. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, and GOOGLE_DRIVE_PARENT_FOLDER_ID to enable it.",
    };
  }

  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { company: true, tasks: true },
  });

  const drive = getDriveClient();

  const projectFolder = await drive.files.create({
    requestBody: {
      name: `${project.company.name} — ${project.name}`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID as string],
    },
    fields: "id, webViewLink",
  });

  const projectFolderId = projectFolder.data.id as string;

  for (const category of TASK_CATEGORIES) {
    await drive.files.create({
      requestBody: {
        name: category,
        mimeType: "application/vnd.google-apps.folder",
        parents: [projectFolderId],
      },
      fields: "id",
    });
  }

  const summaryLines = [
    `${project.name} — Task List Export`,
    `Company: ${project.company.name}`,
    `Status: ${project.status}`,
    "",
    ...TASK_CATEGORIES.flatMap((category) => {
      const tasks = project.tasks.filter((t) => t.category === category);
      if (tasks.length === 0) return [];
      return [
        `## ${category}`,
        ...tasks.map(
          (t) =>
            `- [${t.status}] ${t.title}${t.dueDate ? ` (due ${t.dueDate.toDateString()})` : ""}`
        ),
        "",
      ];
    }),
  ].join("\n");

  await drive.files.create({
    requestBody: {
      name: `${project.name} — Summary`,
      mimeType: "application/vnd.google-apps.document",
      parents: [projectFolderId],
    },
    media: {
      mimeType: "text/plain",
      body: summaryLines,
    },
    fields: "id",
  });

  await db.activityLog.create({
    data: {
      projectId: project.id,
      message: "Exported project folder structure and task summary to Google Drive.",
    },
  });

  return {
    ok: true,
    message: "Exported to Google Drive.",
    folderUrl: projectFolder.data.webViewLink ?? undefined,
  };
}
