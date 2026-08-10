"use client";

import { useState, useTransition } from "react";
import { updateTaskDetails, updateTaskStatus } from "@/lib/actions/tasks";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/constants";
import { SuggestionBadge, TaskStatusBadge } from "@/components/ui";

type TaskRowProps = {
  projectId: string;
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    owner: string | null;
    dueDate: string | null; // ISO string
    notes: string | null;
    aiSuggested: boolean;
  };
};

export function TaskRow({ projectId, task }: TaskRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [owner, setOwner] = useState(task.owner ?? "");
  const [notes, setNotes] = useState(task.notes ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate?.slice(0, 10) ?? "");

  function onStatusChange(status: string) {
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("taskId", task.id);
    fd.set("status", status);
    startTransition(() => updateTaskStatus(fd));
  }

  function onDetailsBlur() {
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("taskId", task.id);
    fd.set("owner", owner);
    fd.set("notes", notes);
    fd.set("dueDate", dueDate);
    startTransition(() => updateTaskDetails(fd));
  }

  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900">{task.title}</span>
            {task.aiSuggested && <SuggestionBadge />}
          </div>
          {task.description && (
            <p className="mt-0.5 text-sm text-neutral-500">{task.description}</p>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <TaskStatusBadge status={task.status} />
          <select
            aria-label="Task status"
            defaultValue={task.status}
            disabled={isPending}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-neutral-100 pt-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Owner</label>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              onBlur={onDetailsBlur}
              className="input"
              placeholder="Who owns this?"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={onDetailsBlur}
              className="input"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs font-medium text-neutral-500">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={onDetailsBlur}
              rows={2}
              className="input"
              placeholder="Free-text notes"
            />
          </div>
        </div>
      )}
    </li>
  );
}
