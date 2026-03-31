import type { Calendar, CalendarEvent, ExpandedOccurrence } from "./schemas/calendar.js";
import type { Space, SpaceMembership } from "./schemas/core.js";
import type { Address, ContactMethod, ImportantDate, Person } from "./schemas/people.js";
import type { ListItem, ShoppingList } from "./schemas/shopping.js";
import type { TaskItem } from "./schemas/tasks.js";

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural ?? `${singular}s`}`;
}

export function formatListHeader(name: string, count: number): string {
  return `${name} (${count}):`;
}

export function formatSpace(space: Space, memberships?: SpaceMembership[]): string {
  const parts = [`${space.name} (id: ${space.id}, type: ${space.spaceType}`];
  if (memberships?.length) {
    parts.push(`, ${pluralize(memberships.length, "member")}`);
  }
  parts.push(")");
  return parts.join("");
}

export function formatCalendar(cal: Calendar): string {
  const parts = [`${cal.name} (id: ${cal.id}, color: ${cal.color}`];
  if (cal.isDefault) {
    parts.push(", default");
  }
  parts.push(")");
  return parts.join("");
}

export function formatEvent(event: CalendarEvent): string {
  const lines: string[] = [];
  lines.push(`${event.title} (id: ${event.id})`);

  if (event.isAllDay) {
    lines.push(`  All Day | ${event.timezone}`);
  } else {
    const start = formatDateTime(event.startAt);
    const end = formatDateTime(event.endAt);
    lines.push(`  ${start} - ${end} | ${event.timezone}`);
  }

  if (event.location) {
    lines.push(`  Location: ${event.location}`);
  }
  if (event.description) {
    lines.push(`  Description: ${event.description}`);
  }
  if (event.recurrenceRule) {
    lines.push(`  Recurrence: ${event.recurrenceRule}`);
  }
  if (event.reminders?.length) {
    const reminderTexts = event.reminders.map((r) => `${r.minutesBefore}min before (${r.method})`);
    lines.push(`  Reminders: ${reminderTexts.join(", ")}`);
  }

  return lines.join("\n");
}

export function formatExpandedOccurrence(occ: ExpandedOccurrence): string {
  if (occ.isAllDay) {
    const label = occ.isRecurring ? "[recurring]" : "";
    return `  All Day        ${occ.title} (${occ.calendarName}) ${label}`.trimEnd();
  }

  const start = formatTime(occ.startAt);
  const end = formatTime(occ.endAt);
  const label = occ.isRecurring ? " [recurring]" : "";
  return `  ${start} - ${end}  ${occ.title} (${occ.calendarName})${label}`;
}

export function formatTask(task: TaskItem): string {
  const lines: string[] = [];
  const statusIcon = task.status === "COMPLETED" ? "[x]" : "[ ]";
  lines.push(`${statusIcon} ${task.title} (id: ${task.id})`);
  lines.push(`    Status: ${task.status} | Priority: ${task.priority}`);

  if (task.dueDate) {
    lines.push(`    Due: ${task.dueDate}`);
  } else if (task.dueAt) {
    lines.push(`    Due: ${formatDateTime(task.dueAt)}`);
  }
  if (task.description) {
    lines.push(`    Description: ${task.description}`);
  }
  if (task.recurrenceRule) {
    lines.push(`    Recurrence: ${task.recurrenceRule}`);
  }
  if (task.categories?.length) {
    const names = task.categories.map((c) => c.name).join(", ");
    lines.push(`    Categories: ${names}`);
  }

  return lines.join("\n");
}

export function formatPerson(person: Person): string {
  const lines: string[] = [];
  lines.push(`${person.firstName} ${person.lastName} (id: ${person.id})`);

  if (person.contactMethods?.length) {
    lines.push("");
    lines.push("Contact Methods:");
    for (const cm of person.contactMethods) {
      lines.push(`  - ${formatContactMethod(cm)}`);
    }
  }

  if (person.addresses?.length) {
    lines.push("");
    lines.push("Addresses:");
    for (const addr of person.addresses) {
      lines.push(`  - ${formatAddress(addr)}`);
    }
  }

  if (person.importantDates?.length) {
    lines.push("");
    lines.push("Important Dates:");
    for (const d of person.importantDates) {
      lines.push(`  - ${formatImportantDate(d)}`);
    }
  }

  if (person.notes) {
    lines.push("");
    lines.push(`Notes: ${person.notes}`);
  }

  return lines.join("\n");
}

export function formatShoppingList(list: ShoppingList): string {
  const lines: string[] = [];
  const itemCount = list.listItems?.length ?? 0;
  lines.push(`${list.name} (id: ${list.id})`);
  lines.push(`Items (${itemCount}):`);

  if (list.listItems?.length) {
    const sorted = [...list.listItems].sort((a, b) => a.sortOrder - b.sortOrder);
    for (const item of sorted) {
      lines.push(`  ${formatListItem(item)}`);
    }
  }

  return lines.join("\n");
}

function formatListItem(item: ListItem): string {
  const check = item.isChecked ? "[x]" : "[ ]";
  const qty =
    item.quantity != null ? ` (qty: ${item.quantity}${item.unit ? ` ${item.unit}` : ""})` : "";
  return `${check} ${item.name}${qty}`;
}

function formatContactMethod(cm: ContactMethod): string {
  const label = cm.label
    ? ` (${cm.label}${cm.isPrimary ? ", primary" : ""})`
    : cm.isPrimary
      ? " (primary)"
      : "";
  return `${cm.type}${label}: ${cm.value}`;
}

function formatAddress(addr: Address): string {
  const label = addr.label
    ? `${addr.label}${addr.isPrimary ? ", primary" : ""}`
    : addr.isPrimary
      ? "primary"
      : "";
  const prefix = label ? `${label}: ` : "";
  const parts = [addr.street1];
  if (addr.street2) parts.push(addr.street2);
  parts.push(addr.city);
  if (addr.state) parts.push(addr.state);
  if (addr.postalCode) parts.push(addr.postalCode);
  parts.push(addr.country);
  return `${prefix}${parts.join(", ")}`;
}

function formatImportantDate(d: ImportantDate): string {
  return `${d.label}: ${d.dateValue}`;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, " UTC");
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
