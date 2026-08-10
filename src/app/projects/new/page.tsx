import { createProject } from "@/lib/actions/projects";
import { BUDGET_TIERS, PROJECT_FORMATS, SHOOT_MODES } from "@/lib/constants";

const SPECIAL_SCENE_FLAGS: { key: string; label: string }[] = [
  { key: "hasStunts", label: "Stunts / choreographed physical action" },
  { key: "hasWeapons", label: "Prop weapons / simulated firearms" },
  { key: "hasMinors", label: "Minors on camera" },
  { key: "hasNudity", label: "Nudity / simulated sex" },
  { key: "hasAnimals", label: "Animals on set" },
  { key: "hasVehicles", label: "Picture vehicles / driving" },
  { key: "hasWaterOrRain", label: "Water proximity / rain" },
  { key: "hasHeights", label: "Rooftops, heights, or ledges" },
  { key: "hasFireOrPyro", label: "Fire, open flame, or pyrotechnics" },
];

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold">New Project Intake</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Answer what you know now — a custom task list and folder structure will be generated
        automatically. Everything here can be edited later.
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
          <Field label="Estimated crew size" htmlFor="crewSizeEstimate">
            <input
              id="crewSizeEstimate"
              name="crewSizeEstimate"
              type="number"
              min={0}
              className="input"
            />
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

        <fieldset className="rounded-lg border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-medium text-neutral-700">
            Special scenes / hazardous activity (used for Phase 2 compliance routing)
          </legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SPECIAL_SCENE_FLAGS.map((flag) => (
              <label key={flag.key} className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" name={flag.key} className="h-4 w-4 rounded border-neutral-300" />
                {flag.label}
              </label>
            ))}
          </div>
        </fieldset>

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
