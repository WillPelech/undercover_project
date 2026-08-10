"use client";

import { useTransition } from "react";
import { updateProjectStatus } from "@/lib/actions/projects";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/constants";

export function ProjectStatusSelect({
  projectId,
  status,
}: {
  projectId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("status", next);
    startTransition(() => updateProjectStatus(fd));
  }

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm"
    >
      {PROJECT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {PROJECT_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
