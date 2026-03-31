import { z } from "zod";

import { BaseEntitySchema } from "./core.js";

export const CategorySchema = BaseEntitySchema.extend({
  name: z.string(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  tenantId: z.uuid(),
});

export type Category = z.infer<typeof CategorySchema>;

export const ProjectSchema = BaseEntitySchema.extend({
  name: z.string(),
  description: z.string().nullable(),
  spaceId: z.uuid(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const TaskCategorySchema = BaseEntitySchema.extend({
  taskItemId: z.uuid(),
  categoryId: z.uuid(),
});

export type TaskCategory = z.infer<typeof TaskCategorySchema>;

export const TaskStatusEnum = z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const TaskPriorityEnum = z.enum(["HIGH", "MEDIUM", "LOW", "NONE"]);

export const TaskItemSchema = BaseEntitySchema.extend({
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  priority: z.string(),
  dueAt: z.iso.datetime().nullable(),
  dueDate: z.string().nullable(),
  recurrenceRule: z.string().nullable(),
  projectId: z.uuid().nullable(),
  spaceId: z.uuid(),
  taskCategories: z.array(TaskCategorySchema).optional(),
  categories: z.array(CategorySchema).optional(),
});

export type TaskItem = z.infer<typeof TaskItemSchema>;
