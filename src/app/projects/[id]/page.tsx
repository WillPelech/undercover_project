import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TASK_CATEGORIES } from "@/lib/constants";
import { SPECIAL_SCENE_FLAGS } from "@/lib/special-scenes";
import { TaskRow } from "@/components/task-row";
import { ProjectStatusSelect } from "@/components/project-status-select";
import { DriveExportButton } from "@/components/drive-export-button";
import { addManualTask } from "@/lib/actions/tasks";
import { updateProductionLogistics } from "@/lib/actions/projects";
import { generateEmailDraft, markEmailSent, deleteEmailDraft } from "@/lib/actions/emails";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      company: true,
      tasks: { orderBy: [{ category: "asc" }, { dueDate: "asc" }] },
      emailDrafts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) notFound();

  const tasksByCategory = TASK_CATEGORIES.map((category) => ({
    category,
    tasks: project.tasks.filter((t) => t.category === category),
  }));

  const relevantTasks = project.tasks.filter((t) => t.status !== "n_a");
  const completeCount = relevantTasks.filter((t) => t.status === "complete").length;

  return (
    <div className="space-y-10">
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <p className="mt-1 text-sm text-neutral-500">{project.company.name}</p>
          </div>
          <ProjectStatusSelect projectId={project.id} status={project.status} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <Info label="Format" value={project.format} />
          <Info label="Budget tier" value={project.budgetTier} />
          <Info label="Shoot mode" value={project.shootMode} />
          <Info label="Location" value={project.locationText || "—"} />
          <Info label="Crew size" value={project.crewSizeEstimate?.toString() || "—"} />
          <Info
            label="Shoot date"
            value={project.targetShootDate?.toLocaleDateString() || "TBD"}
          />
          <Info
            label="Delivery date"
            value={project.targetDeliveryDate?.toLocaleDateString() || "TBD"}
          />
          <Info label="Task progress" value={`${completeCount}/${relevantTasks.length}`} />
        </dl>

        <div className="mt-4">
          <DriveExportButton projectId={project.id} />
        </div>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Production Logistics</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Fill this in once the script/storyboard locks — crew size and special-scene flags
          unlock the relevant compliance and logistics tasks below.
        </p>
        <form action={updateProductionLogistics} className="mt-4 space-y-4">
          <input type="hidden" name="projectId" value={project.id} />
          <div className="max-w-xs">
            <label
              htmlFor="crewSizeEstimate"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Crew size
            </label>
            <input
              id="crewSizeEstimate"
              name="crewSizeEstimate"
              type="number"
              min={0}
              defaultValue={project.crewSizeEstimate ?? ""}
              className="input"
            />
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-neutral-700">
              Special scenes / hazardous activity
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SPECIAL_SCENE_FLAGS.map((flag) => (
                <label
                  key={flag.key}
                  className="flex items-center gap-2 text-sm text-neutral-700"
                >
                  <input
                    type="checkbox"
                    name={flag.key}
                    defaultChecked={Boolean(
                      project[flag.key as keyof typeof project]
                    )}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  {flag.label}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Save & regenerate suggested tasks
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="mt-4 space-y-8">
          {tasksByCategory.map(({ category, tasks }) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                {category} ({tasks.length})
              </h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-neutral-400">No tasks in this category.</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      projectId={project.id}
                      task={{
                        ...task,
                        dueDate: task.dueDate?.toISOString() ?? null,
                      }}
                    />
                  ))}
                </ul>
              )}
              <form action={addManualTask} className="mt-2 flex gap-2">
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="category" value={category} />
                <input
                  name="title"
                  placeholder={`Add a task to ${category}…`}
                  className="input flex-1"
                />
                <button
                  type="submit"
                  className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  Add
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Email drafts</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Drafts only — nothing is sent automatically. Review, copy, and send yourself.
        </p>
        <div className="mt-4 flex gap-2">
          {(["kickoff", "status_update", "nudge"] as const).map((source) => (
            <form key={source} action={generateEmailDraft}>
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="templateSource" value={source} />
              <button
                type="submit"
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm capitalize text-neutral-700 hover:bg-neutral-50"
              >
                Generate {source.replace("_", " ")} draft
              </button>
            </form>
          ))}
        </div>

        <ul className="mt-4 space-y-3">
          {project.emailDrafts.map((draft) => (
            <li key={draft.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-violet-700">
                    Suggestion · {draft.templateSource.replace("_", " ")} ·{" "}
                    {draft.status === "marked_sent" ? "marked sent" : "draft"}
                  </p>
                  <p className="mt-1 font-medium">{draft.subject}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {draft.status !== "marked_sent" && (
                    <form action={markEmailSent}>
                      <input type="hidden" name="emailId" value={draft.id} />
                      <input type="hidden" name="projectId" value={project.id} />
                      <button className="text-xs font-medium text-green-700 hover:underline">
                        Mark sent
                      </button>
                    </form>
                  )}
                  <form action={deleteEmailDraft}>
                    <input type="hidden" name="emailId" value={draft.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <button className="text-xs font-medium text-neutral-400 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-md bg-neutral-50 p-3 text-sm text-neutral-700">
                {draft.body}
              </pre>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-400">{label}</dt>
      <dd className="font-medium text-neutral-800">{value}</dd>
    </div>
  );
}
