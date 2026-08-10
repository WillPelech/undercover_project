"use client";

import { useState, useTransition } from "react";
import { exportProjectToDrive } from "@/lib/actions/drive";

export function DriveExportButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    folderUrl?: string;
  } | null>(null);

  function onClick() {
    startTransition(async () => {
      const res = await exportProjectToDrive(projectId);
      setResult(res);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
      >
        {isPending ? "Exporting…" : "Export to Google Drive"}
      </button>
      {result && (
        <p className={`mt-2 text-xs ${result.ok ? "text-green-700" : "text-amber-700"}`}>
          {result.message}{" "}
          {result.folderUrl && (
            <a href={result.folderUrl} target="_blank" className="underline">
              Open folder
            </a>
          )}
        </p>
      )}
    </div>
  );
}
