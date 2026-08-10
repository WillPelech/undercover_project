import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const url = (process.env.DATABASE_URL ?? "file:./dev.db").replace(
  /^file:/,
  ""
);
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

/**
 * Starter task-template library, adapted from the NYU UGFTV 5-folder
 * checklist pattern (Production Info / Safety / Personnel / Locations /
 * Rentals) into commercial & branded production categories, and shaped by
 * the a16z Portco Video Engagement Playbook's phase structure (Intro ->
 * Creative Brief -> Kickoff -> Pre-pro -> Production -> Post -> Delivery).
 *
 * `dueOffsetDays` = days before targetShootDate the task is due.
 * Negative values are due *after* the shoot (post-production/delivery).
 */
const templates: {
  title: string;
  description: string;
  category: string;
  conditions: object;
  dueOffsetDays: number;
  sortOrder: number;
}[] = [
  // --- Production Info ---
  {
    title: "Confirm project brief & scope",
    description:
      "Lock the one-paragraph brief: goal, primary audience, format, and any hard constraints before anything else moves.",
    category: "Production Info",
    conditions: {},
    dueOffsetDays: 21,
    sortOrder: 1,
  },
  {
    title: "Share services overview & recommend format",
    description:
      "Walk the client through video type options and recommend the highest-impact format for their goal (mirrors the a16z 'Intro + Services Menu' step).",
    category: "Production Info",
    conditions: {},
    dueOffsetDays: 20,
    sortOrder: 2,
  },
  {
    title: "Build & share creative brief",
    description:
      "2-page max creative brief: concept, tone, structure, plus reference examples. Come with a point of view rather than a blank slate.",
    category: "Production Info",
    conditions: {},
    dueOffsetDays: 18,
    sortOrder: 3,
  },
  {
    title: "Lock creative direction sign-off",
    description:
      "Get explicit client sign-off on the creative brief before moving into scheduling/logistics.",
    category: "Production Info",
    conditions: {},
    dueOffsetDays: 16,
    sortOrder: 4,
  },
  {
    title: "Draft & send kickoff timeline email",
    description:
      "Send the working timeline: pre-production, shoot window, V1/V2 cuts, final delivery dates.",
    category: "Production Info",
    conditions: {},
    dueOffsetDays: 15,
    sortOrder: 5,
  },
  {
    title: "Confirm budget & PO with client",
    description: "Confirm final budget tier and get a PO / written approval before booking vendors.",
    category: "Production Info",
    conditions: {},
    dueOffsetDays: 19,
    sortOrder: 6,
  },
  {
    title: "Send V1 cut for review",
    description:
      "Share first cut with clear feedback instructions (big-picture notes first: structure, messaging, pacing).",
    category: "Production Info",
    conditions: {},
    dueOffsetDays: -7,
    sortOrder: 7,
  },
  {
    title: "Send final delivery",
    description:
      "Deliver final video file(s) + social cutdowns if applicable, and confirm client sign-off.",
    category: "Production Info",
    conditions: {},
    dueOffsetDays: -21,
    sortOrder: 8,
  },

  // --- Crew ---
  {
    title: "Confirm director / DP / key crew",
    description: "Lock key creative + technical roles before scheduling logistics.",
    category: "Crew",
    conditions: {},
    dueOffsetDays: 14,
    sortOrder: 1,
  },
  {
    title: "Build full crew list & contact sheet",
    description:
      "Names, roles, phone, email, and emergency contact for every on-set crew member.",
    category: "Crew",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 10,
    sortOrder: 2,
  },
  {
    title: "Size crew against budget tier",
    description: "Sanity-check crew size and day rates against the confirmed budget tier.",
    category: "Crew",
    conditions: { crewSizeEstimateGte: 5 },
    dueOffsetDays: 12,
    sortOrder: 3,
  },
  {
    title: "Collect crew availability confirmations",
    description: "Get written confirmation of availability from every crew member for all shoot days.",
    category: "Crew",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 7,
    sortOrder: 4,
  },
  {
    title: "Book additional production assistants",
    description: "Larger crews need dedicated PAs for logistics, holding, and equipment runs.",
    category: "Crew",
    conditions: { crewSizeEstimateGte: 10 },
    dueOffsetDays: 7,
    sortOrder: 5,
  },
  {
    title: "Coordinate talent / interview scheduling",
    description: "Confirm on-camera talent availability and share interview questions ahead of the shoot.",
    category: "Crew",
    conditions: { formatIn: ["talking-head", "docu-style", "narrative"] },
    dueOffsetDays: 9,
    sortOrder: 6,
  },

  // --- Locations ---
  {
    title: "Scout & confirm shoot location(s)",
    description: "Confirm exact address(es) and get owner sign-off for each location.",
    category: "Locations",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 14,
    sortOrder: 1,
  },
  {
    title: "Get signed location permission / agreement",
    description: "Upload a signed location agreement for every address being used.",
    category: "Locations",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 10,
    sortOrder: 2,
  },
  {
    title: "Take scout photos of each location",
    description: "At least 2 photos of the exact spaces being filmed, plus breaker box photos if using high-powered lights.",
    category: "Locations",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 8,
    sortOrder: 3,
  },
  {
    title: "Log nearest hospital / emergency access per location",
    description: "Note the nearest 24-hour ER and distance for every shoot location as a basic safety plan.",
    category: "Locations",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 8,
    sortOrder: 4,
  },
  {
    title: "Set up remote shoot logistics",
    description: "Arrange screen recording access, shipping of any gear, and a remote-directing plan.",
    category: "Locations",
    conditions: { shootModeIn: ["remote", "hybrid"] },
    dueOffsetDays: 10,
    sortOrder: 5,
  },

  // --- Legal & Insurance ---
  {
    title: "Confirm COI requirements per location/vendor",
    description: "Determine which locations and vendors require a Certificate of Insurance before booking.",
    category: "Legal & Insurance",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 12,
    sortOrder: 1,
  },
  {
    title: "Request Certificates of Insurance (COIs)",
    description: "COIs can take several business days to process — request them well ahead of check-out/shoot day.",
    category: "Legal & Insurance",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 9,
    sortOrder: 2,
  },
  {
    title: "Collect signed talent release forms",
    description: "Every on-camera participant needs a signed release before footage can be used.",
    category: "Legal & Insurance",
    conditions: {},
    dueOffsetDays: 10,
    sortOrder: 3,
  },
  {
    title: "Flag special-scene compliance needs",
    description:
      "This project was flagged for minors, stunts, weapons, and/or nudity — route to Phase 2 compliance review before scheduling those scenes. (Placeholder: full conditional checklist logic ships in Phase 2.)",
    category: "Legal & Insurance",
    conditions: {
      flagAnyOf: ["hasMinors", "hasStunts", "hasWeapons", "hasNudity"],
    },
    dueOffsetDays: 14,
    sortOrder: 4,
  },
  {
    title: "Confirm music licensing",
    description: "Confirm any licensed music is cleared worldwide/in perpetuity for the intended distribution channels.",
    category: "Legal & Insurance",
    conditions: {},
    dueOffsetDays: -3,
    sortOrder: 5,
  },

  // --- Equipment & Rentals ---
  {
    title: "Build equipment / gear list",
    description: "List camera, sound, grip, and lighting needs based on the creative brief.",
    category: "Equipment & Rentals",
    conditions: {},
    dueOffsetDays: 10,
    sortOrder: 1,
  },
  {
    title: "Get rental quotes from vetted vendors",
    description: "Quotes must include replacement value for each piece of rented equipment.",
    category: "Equipment & Rentals",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 9,
    sortOrder: 2,
  },
  {
    title: "Confirm specialty equipment needs",
    description: "Drones, generators, jibs, or other specialty rigs need extra lead time and sometimes separate insurance.",
    category: "Equipment & Rentals",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 8,
    sortOrder: 3,
  },
  {
    title: "Arrange equipment transport & storage plan",
    description: "Camera/sound gear must always be stored securely — plan overnight storage locations in advance.",
    category: "Equipment & Rentals",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: 6,
    sortOrder: 4,
  },
  {
    title: "Plan equipment returns",
    description: "Write a clear return timeline: camera wrap time through final drop-off of all rented gear.",
    category: "Equipment & Rentals",
    conditions: { shootMode: "in-person" },
    dueOffsetDays: -1,
    sortOrder: 5,
  },
];

async function main() {
  console.log(`Seeding ${templates.length} task templates...`);
  for (const t of templates) {
    const existing = await db.taskTemplate.findFirst({
      where: { title: t.title, category: t.category },
    });
    if (existing) {
      await db.taskTemplate.update({
        where: { id: existing.id },
        data: {
          description: t.description,
          conditions: JSON.stringify(t.conditions),
          dueOffsetDays: t.dueOffsetDays,
          sortOrder: t.sortOrder,
        },
      });
    } else {
      await db.taskTemplate.create({
        data: {
          title: t.title,
          description: t.description,
          category: t.category,
          conditions: JSON.stringify(t.conditions),
          dueOffsetDays: t.dueOffsetDays,
          sortOrder: t.sortOrder,
        },
      });
    }
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
