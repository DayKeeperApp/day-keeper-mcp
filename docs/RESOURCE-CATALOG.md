# Resource Catalog

Complete reference for all MCP resources provided by the Day Keeper MCP server.

Resources are read-only data sources that MCP clients can surface to users or models. They use the
`daykeeper://` URI scheme.

---

## Static Listing Resources

These resources have fixed URIs and return collection data.

### `daykeeper://spaces`

All spaces accessible to the current tenant.

**Response format**: Plain text listing of spaces with ID, name, type, and member count.

```text
Spaces (3):
  - Personal (id: abc-123, type: personal, default)
  - Family (id: def-456, type: shared, 4 members)
  - Work Projects (id: ghi-789, type: shared, 2 members)
```

---

### `daykeeper://calendars`

All calendars across all spaces.

**Response format**: Plain text listing grouped by space.

```text
Calendars (5):

Personal:
  - My Calendar (id: cal-001, color: #4285f4, default)
  - Birthdays (id: cal-002, color: #ea4335)

Family:
  - Family Events (id: cal-003, color: #34a853, default)
  - School Schedule (id: cal-004, color: #fbbc04)

Work Projects:
  - Meetings (id: cal-005, color: #4285f4, default)
```

---

### `daykeeper://projects`

All projects across all spaces.

**Response format**: Plain text listing grouped by space with task counts.

```text
Projects (4):

Personal:
  - Home Renovation (id: proj-001, 12 tasks, 4 completed)
  - Reading List (id: proj-002, 8 tasks, 6 completed)

Work Projects:
  - Q2 Launch (id: proj-003, 24 tasks, 10 completed)
  - Tech Debt (id: proj-004, 15 tasks, 3 completed)
```

---

### `daykeeper://categories`

All task categories available in the tenant.

**Response format**: Plain text listing with colors and icons.

```text
Categories (6):
  - Urgent (id: cat-001, color: #ea4335, icon: fire)
  - Personal (id: cat-002, color: #34a853, icon: person)
  - Work (id: cat-003, color: #4285f4, icon: briefcase)
  - Health (id: cat-004, color: #fbbc04, icon: heart)
  - Finance (id: cat-005, color: #9c27b0, icon: dollar)
  - Learning (id: cat-006, color: #00bcd4, icon: book)
```

---

### `daykeeper://event-types`

All event types defined in the tenant.

**Response format**: Plain text listing.

```text
Event Types (4):
  - Meeting (id: et-001)
  - Appointment (id: et-002)
  - Birthday (id: et-003, system)
  - Anniversary (id: et-004, system)
```

---

## Dynamic Template Resources

These resources use URI templates with variables. MCP clients can discover available entities via
the template's list callback.

### `daykeeper://space/{spaceId}`

Detailed view of a specific space including membership list.

**URI variable**: `spaceId` — UUID of the space

**Response format**:

```text
Space: Family (id: def-456)
Type: shared
Created: 2026-01-15

Members (4):
  - John Smith (owner) — john@example.com
  - Jane Smith (editor) — jane@example.com
  - Bob Smith (editor) — bob@example.com
  - Alice Smith (viewer) — alice@example.com

Contents:
  - 2 calendars
  - 3 projects
  - 45 tasks
  - 12 people
  - 3 shopping lists
```

---

### `daykeeper://calendar/{calendarId}`

Calendar details with event summary.

**URI variable**: `calendarId` — UUID of the calendar

**Response format**:

```text
Calendar: Family Events (id: cal-003)
Space: Family
Color: #34a853
Default: yes

Recent events (last 7 days):
  - Mar 25: Family Dinner (7:00 PM)
  - Mar 27: Soccer Practice (4:00 PM) [recurring weekly]
  - Mar 29: Grocery Shopping (10:00 AM)

Upcoming events (next 7 days):
  - Mar 31: Dentist - Mom (2:00 PM)
  - Apr 1: Soccer Practice (4:00 PM) [recurring weekly]
  - Apr 3: Date Night (7:00 PM)
```

---

### `daykeeper://event/{eventId}`

Full event details including reminders and recurrence exceptions.

**URI variable**: `eventId` — UUID of the calendar event

**Response format**:

```text
Event: Team Standup (id: evt-001)
Calendar: Meetings (Work Projects)
Type: Meeting

When: Mon-Fri 9:00 - 9:30 AM (America/Chicago)
Recurrence: FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
Location: Conference Room B

Reminders:
  - 10 minutes before (push notification)

Recurrence Exceptions:
  - Apr 7: Cancelled (company holiday)
  - Apr 14: Modified — starts at 10:00 AM (schedule conflict)

Created: 2026-02-01
Updated: 2026-03-15
```

---

### `daykeeper://task/{taskId}`

Full task details with categories and project.

**URI variable**: `taskId` — UUID of the task item

**Response format**:

```text
Task: Update API documentation (id: task-001)
Project: Q2 Launch (Work Projects)
Status: OPEN
Priority: HIGH
Due: Apr 5, 2026

Categories: Work, Urgent

Description:
  Update the API docs to reflect the new sync protocol
  changes from sprint 12.

Created: 2026-03-20
Updated: 2026-03-28
```

---

### `daykeeper://person/{personId}`

Full contact details with all contact methods, addresses, and important dates.

**URI variable**: `personId` — UUID of the person

**Response format**:

```text
Person: Jane Smith (id: person-001)
Space: Family

Contact Methods:
  - Phone (mobile, primary): +1-555-0123
  - Email (work): jane@company.com
  - Email (personal): jane.smith@gmail.com

Addresses:
  - Home (primary): 123 Main St, Springfield, IL 62701, US

Important Dates:
  - Birthday: March 15
  - Anniversary: June 22

Notes: Sister, lives in Springfield. Allergic to shellfish.

Created: 2026-01-20
Updated: 2026-03-10
```

---

### `daykeeper://shopping-list/{listId}`

Shopping list with all items and their status.

**URI variable**: `listId` — UUID of the shopping list

**Response format**:

```text
Shopping List: Grocery Run (id: list-001)
Space: Family
Items (7, 2 checked):

  [ ] Milk (qty: 1 gallon)
  [ ] Bread (qty: 2 loaves)
  [x] Eggs (qty: 1 dozen)
  [ ] Chicken breast (qty: 2 lbs)
  [ ] Rice (qty: 1 bag)
  [ ] Broccoli (qty: 2 heads)
  [x] Butter (qty: 1)

Created: 2026-03-28
Updated: 2026-03-29
```

---

## Schema Reference Resources

### `daykeeper://schema/entities`

Reference documentation for all 22 Day Keeper entity types, their fields, and relationships. Useful
for LLMs to understand the data model.

**Response format**:

```text
Day Keeper Entity Types (22):

Core:
  - Tenant: Root organization. Fields: id, name, slug, ...
  - User: Person with account. Fields: id, email, displayName, tenantId, ...
  - Space: Shared context (personal/shared). Fields: id, name, spaceType, tenantId, ...
  - SpaceMembership: User's role in a space. Fields: id, spaceId, userId, role, ...

Calendar:
  - Calendar: Event container in a space. Fields: id, name, color, isDefault, spaceId, ...
  - CalendarEvent: Scheduled event. Fields: id, title, startAt, endAt, timezone, recurrenceRule, calendarId, ...
  - EventReminder: Notification before event. Fields: id, minutesBefore, method, calendarEventId, ...
  - RecurrenceException: Override for single occurrence. Fields: id, originalStartAt, isCancelled, calendarEventId, ...
  - EventType: Category for events. Fields: id, name, tenantId, ...

Tasks:
  - Project: Task container in a space. Fields: id, name, description, spaceId, ...
  - TaskItem: Action item. Fields: id, title, status, priority, dueAt, projectId, spaceId, ...
  - TaskCategory: Link between task and category. Fields: id, taskItemId, categoryId, ...
  - Category: Tag for tasks. Fields: id, name, color, icon, tenantId, ...

People:
  - Person: Contact in a space. Fields: id, firstName, lastName, notes, spaceId, ...
  - ContactMethod: Phone/email/etc. Fields: id, type, value, label, isPrimary, personId, ...
  - Address: Physical address. Fields: id, street1, city, country, isPrimary, personId, ...
  - ImportantDate: Birthday/anniversary. Fields: id, label, dateValue, personId, ...

Shopping:
  - ShoppingList: List container in a space. Fields: id, name, spaceId, ...
  - ListItem: Item on a list. Fields: id, name, quantity, unit, isChecked, sortOrder, shoppingListId, ...

Other:
  - Attachment: File linked to event/task/person. Fields: id, fileName, contentType, fileSize, ...
  - Device: Registered mobile device. Fields: id, userId, ...
  - DeviceNotificationPreference: Notification settings. Fields: id, deviceId, ...

All entities include: id (UUID), createdAt, updatedAt, deletedAt (soft-delete), isDeleted
```
