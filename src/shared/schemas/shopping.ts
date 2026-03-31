import { z } from "zod";

import { BaseEntitySchema } from "./core.js";

export const ListItemSchema = BaseEntitySchema.extend({
  name: z.string(),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  isChecked: z.boolean(),
  sortOrder: z.number().int(),
  shoppingListId: z.uuid(),
});

export type ListItem = z.infer<typeof ListItemSchema>;

export const ShoppingListSchema = BaseEntitySchema.extend({
  name: z.string(),
  spaceId: z.uuid(),
  listItems: z.array(ListItemSchema).optional(),
});

export type ShoppingList = z.infer<typeof ShoppingListSchema>;
