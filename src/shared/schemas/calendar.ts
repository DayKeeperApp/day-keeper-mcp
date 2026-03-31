import { z } from "zod";

import { BaseEntitySchema } from "./core.js";

export const EventTypeSchema = BaseEntitySchema.extend({
  name: z.string(),
  tenantId: z.uuid(),
});

export type EventType = z.infer<typeof EventTypeSchema>;

export const CalendarSchema = BaseEntitySchema.extend({
  name: z.string(),
  color: z.string(),
  isDefault: z.boolean(),
  spaceId: z.uuid(),
});

export type Calendar = z.infer<typeof CalendarSchema>;

export const EventReminderSchema = BaseEntitySchema.extend({
  minutesBefore: z.number().int(),
  method: z.string(),
  calendarEventId: z.uuid(),
});

export type EventReminder = z.infer<typeof EventReminderSchema>;

export const RecurrenceExceptionSchema = BaseEntitySchema.extend({
  originalStartAt: z.iso.datetime(),
  isCancelled: z.boolean(),
  calendarEventId: z.uuid(),
  title: z.string().nullable().optional(),
  startAt: z.iso.datetime().nullable().optional(),
  endAt: z.iso.datetime().nullable().optional(),
});

export type RecurrenceException = z.infer<typeof RecurrenceExceptionSchema>;

export const CalendarEventSchema = BaseEntitySchema.extend({
  title: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  timezone: z.string(),
  isAllDay: z.boolean(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  recurrenceRule: z.string().nullable(),
  calendarId: z.uuid(),
  eventTypeId: z.uuid().nullable(),
  reminders: z.array(EventReminderSchema).optional(),
  recurrenceExceptions: z.array(RecurrenceExceptionSchema).optional(),
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const ExpandedOccurrenceSchema = z.object({
  calendarEventId: z.uuid(),
  title: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  timezone: z.string(),
  isAllDay: z.boolean(),
  isRecurring: z.boolean(),
  originalStartAt: z.iso.datetime().nullable(),
  calendarId: z.uuid(),
  calendarName: z.string(),
});

export type ExpandedOccurrence = z.infer<typeof ExpandedOccurrenceSchema>;
