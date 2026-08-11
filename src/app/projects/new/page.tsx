import { createProject } from "@/lib/actions/projects";
import { BUDGET_TIERS, PROJECT_FORMATS, SHOOT_MODES } from "@/lib/constants";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold">New Project Intake</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Answer what you know now — a starting task list and folder structure will be
        generated automatically. Crew size and special-scene details come later, once the
        script/storyboard locks and the project moves into Production Logistics.
      </p>

      <form action={createProject} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Project name" htmlFor="name">
            <input
              id="name"
              name="name"
              required
              placeholder="e.g. Acme Corp — Series A Launch Video"
              className="input"
            />
          </Field>
          <Field label="Company / client" htmlFor="companyName">
            <input id="companyName" name="companyName" required className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Format" htmlFor="format">
            <select id="format" name="format" className="input" defaultValue={PROJECT_FORMATS[0]}>
              {PROJECT_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Budget tier" htmlFor="budgetTier">
            <select
              id="budgetTier"
              name="budgetTier"
              className="input"
              defaultValue={BUDGET_TIERS[1]}
            >
              {BUDGET_TIERS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Shoot mode" htmlFor="shootMode">
            <select
              id="shootMode"
              name="shootMode"
              className="input"
              defaultValue={SHOOT_MODES[0]}
            >
              {SHOOT_MODES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Location (city/notes)" htmlFor="locationText">
            <input id="locationText" name="locationText" placeholder="e.g. New York, NY" className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Target shoot date" htmlFor="targetShootDate">
            <input id="targetShootDate" name="targetShootDate" type="date" className="input" />
          </Field>
          <Field label="Target delivery date" htmlFor="targetDeliveryDate">
            <input id="targetDeliveryDate" name="targetDeliveryDate" type="date" className="input" />
          </Field>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Generate project workspace
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      {children}
    </div>
  );
}
