import { z } from "zod";

import { BaseEntitySchema } from "./core.js";

export const ContactMethodTypeEnum = z.enum(["PHONE", "EMAIL", "OTHER"]);

export const ContactMethodSchema = BaseEntitySchema.extend({
  type: z.string(),
  value: z.string(),
  label: z.string().nullable(),
  isPrimary: z.boolean(),
  personId: z.uuid(),
});

export type ContactMethod = z.infer<typeof ContactMethodSchema>;

export const AddressSchema = BaseEntitySchema.extend({
  street1: z.string(),
  street2: z.string().nullable(),
  city: z.string(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string(),
  label: z.string().nullable(),
  isPrimary: z.boolean(),
  personId: z.uuid(),
});

export type Address = z.infer<typeof AddressSchema>;

export const ImportantDateSchema = BaseEntitySchema.extend({
  label: z.string(),
  dateValue: z.string(),
  personId: z.uuid(),
  eventTypeId: z.uuid().nullable(),
});

export type ImportantDate = z.infer<typeof ImportantDateSchema>;

export const PersonSchema = BaseEntitySchema.extend({
  firstName: z.string(),
  lastName: z.string(),
  notes: z.string().nullable(),
  spaceId: z.uuid(),
  contactMethods: z.array(ContactMethodSchema).optional(),
  addresses: z.array(AddressSchema).optional(),
  importantDates: z.array(ImportantDateSchema).optional(),
});

export type Person = z.infer<typeof PersonSchema>;
