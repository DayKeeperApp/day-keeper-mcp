import { z } from "zod";

export const SyncPullRequestSchema = z.object({
  cursor: z.number().int().nullable(),
  spaceId: z.uuid().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
});

export type SyncPullRequest = z.infer<typeof SyncPullRequestSchema>;

export const SyncChangeSchema = z.object({
  changeId: z.number().int(),
  entityType: z.string(),
  entityId: z.uuid(),
  operation: z.string(),
  changedAt: z.iso.datetime(),
  data: z.record(z.string(), z.unknown()).nullable(),
});

export type SyncChange = z.infer<typeof SyncChangeSchema>;

export const SyncPullResponseSchema = z.object({
  changes: z.array(SyncChangeSchema),
  cursor: z.number().int(),
  hasMore: z.boolean(),
});

export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>;

export const SyncPushRequestSchema = z.object({
  changes: z.array(
    z.object({
      entityType: z.string(),
      entityId: z.uuid(),
      operation: z.string(),
      data: z.record(z.string(), z.unknown()),
    }),
  ),
});

export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;

export const SyncConflictSchema = z.object({
  entityType: z.string(),
  entityId: z.uuid(),
  reason: z.string(),
});

export type SyncConflict = z.infer<typeof SyncConflictSchema>;

export const SyncPushResponseSchema = z.object({
  accepted: z.number().int(),
  rejected: z.number().int(),
  conflicts: z.array(SyncConflictSchema),
});

export type SyncPushResponse = z.infer<typeof SyncPushResponseSchema>;
