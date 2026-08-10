import Link from "next/link";
import { db } from "@/lib/db";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";
import { ProjectStatusBadge, ProgressBar } from "@/components/ui";

function progressFor(tasks: { status: string }[]) {
  const relevant = tasks.filter((t) => t.status !== "n_a");
  if (relevant.length === 0) return 0;
  const done = relevant.filter((t) => t.status === "complete").length;
  return done / relevant.length;
}

const GROUP_ORDER: ProjectStatus[] = [
  "intake",
  "pre-production",
  "production",
  "post-production",
  "delivered",
  "archived",
];

export default async function DashboardPage() {
  const projects = await db.project.findMany({
    include: { company: true, tasks: { select: { status: true } } },
    orderBy: { updatedAt: "desc" },
  });

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-12 text-center">
        <h1 className="text-lg font-semibold">No projects yet</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Kick off your first project intake to generate a custom task list and folder structure.
        </p>
        <Link
          href="/projects/new"
          className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700"
        >
          New Project
        </Link>
      </div>
    );
  }

  const grouped = GROUP_ORDER.map((status) => ({
    status,
    projects: projects.filter((p) => p.status === status),
  })).filter((g) => g.projects.length > 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold">Projects</h1>
        <p className="mt-1 text-sm text-neutral-600">
          All projects across every company, grouped by production status.
        </p>
      </div>

      {grouped.map((group) => (
        <section key={group.status}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {PROJECT_STATUS_LABELS[group.status]} ({group.projects.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-neutral-900">{project.name}</h3>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <p className="mt-1 text-xs text-neutral-500">{project.company.name}</p>
                <p className="mt-2 text-xs text-neutral-500">
                  {project.format} · {project.shootMode}
                  {project.targetShootDate
                    ? ` · shoot ${project.targetShootDate.toLocaleDateString()}`
                    : ""}
                </p>
                <div className="mt-3">
                  <ProgressBar value={progressFor(project.tasks)} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
