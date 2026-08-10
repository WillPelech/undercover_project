import { z } from "zod";
import {
  BUDGET_TIERS,
  PROJECT_FORMATS,
  PROJECT_STATUSES,
  SHOOT_MODES,
  TASK_CATEGORIES,
  TASK_STATUSES,
} from "@/lib/constants";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  companyName: z.string().min(1, "Company is required"),
  format: z.enum(PROJECT_FORMATS),
  budgetTier: z.enum(BUDGET_TIERS),
  shootMode: z.enum(SHOOT_MODES),
  locationText: z.string().optional(),
  crewSizeEstimate: z.coerce.number().int().min(0).optional(),
  targetShootDate: z.string().optional(), // yyyy-mm-dd from <input type="date">
  targetDeliveryDate: z.string().optional(),
  hasStunts: z.coerce.boolean().optional(),
  hasWeapons: z.coerce.boolean().optional(),
  hasMinors: z.coerce.boolean().optional(),
  hasNudity: z.coerce.boolean().optional(),
  hasAnimals: z.coerce.boolean().optional(),
  hasVehicles: z.coerce.boolean().optional(),
  hasWaterOrRain: z.coerce.boolean().optional(),
  hasHeights: z.coerce.boolean().optional(),
  hasFireOrPyro: z.coerce.boolean().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(TASK_STATUSES).optional(),
  owner: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

export const updateProjectStatusSchema = z.object({
  projectId: z.string().min(1),
  status: z.enum(PROJECT_STATUSES),
});

export const generateEmailSchema = z.object({
  projectId: z.string().min(1),
  templateSource: z.enum(["kickoff", "status_update", "nudge"]),
});

export const taskCategorySchema = z.enum(TASK_CATEGORIES);
