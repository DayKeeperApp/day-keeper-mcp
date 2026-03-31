import { z } from "zod";

// Base fields shared by all Day Keeper entities
export const BaseEntitySchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  isDeleted: z.boolean(),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;

// Core entities

export const TenantSchema = BaseEntitySchema.extend({
  name: z.string(),
  slug: z.string(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const UserSchema = BaseEntitySchema.extend({
  email: z.string(),
  displayName: z.string(),
  tenantId: z.uuid(),
});

export type User = z.infer<typeof UserSchema>;

export const SpaceSchema = BaseEntitySchema.extend({
  name: z.string(),
  spaceType: z.string(),
  tenantId: z.uuid(),
});

export type Space = z.infer<typeof SpaceSchema>;

export const SpaceMembershipSchema = BaseEntitySchema.extend({
  spaceId: z.uuid(),
  userId: z.uuid(),
  role: z.string(),
});

export type SpaceMembership = z.infer<typeof SpaceMembershipSchema>;
