# Tool Catalog

Complete reference for all MCP tools provided by the Day Keeper MCP server.

---

## Calendar Domain

### `calendar-list`

List all calendars, optionally filtered by space.

| Parameter | Type            | Required | Description               |
| --------- | --------------- | -------- | ------------------------- |
| `spaceId` | `string (UUID)` | No       | Filter calendars by space |

**GraphQL**: `calendars(spaceId?)` → `CalendarsConnection`

**Example response**:

```text
Calendars (3):
  - Work Calendar (id: abc-123, space: Personal, color: #4285f4)
  - Family Calendar (id: def-456, space: Family, color: #34a853)
  - Birthdays (id: ghi-789, space: Personal, color: #ea4335, default)
```

---

### `calendar-create`

Create a new calendar in a space.

| Parameter   | Type            | Required | Description                              |
| ----------- | --------------- | -------- | ---------------------------------------- |
| `spaceId`   | `string (UUID)` | Yes      | Space to create the calendar in          |
| `name`      | `string`        | Yes      | Calendar name                            |
| `color`     | `string`        | Yes      | Hex color code (e.g., `#4285f4`)         |
| `isDefault` | `boolean`       | No       | Set as default calendar (default: false) |

**GraphQL**: `createCalendar` mutation

---

### `calendar-update`

Update an existing calendar's name or color.

| Parameter | Type            | Required | Description   |
| --------- | --------------- | -------- | ------------- |
| `id`      | `string (UUID)` | Yes      | Calendar ID   |
| `name`    | `string`        | No       | New name      |
| `color`   | `string`        | No       | New hex color |

**GraphQL**: `updateCalendar` mutation

---

### `calendar-delete`

Delete a calendar (soft-delete).

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string (UUID)` | Yes      | Calendar ID |

**GraphQL**: `deleteCalendar` mutation

---

### `event-list`

List calendar events with optional filters.

| Parameter    | Type            | Required | Description                       |
| ------------ | --------------- | -------- | --------------------------------- |
| `calendarId` | `string (UUID)` | No       | Filter by calendar                |
| `first`      | `number`        | No       | Page size (default: 25, max: 100) |
| `after`      | `string`        | No       | Pagination cursor                 |

**GraphQL**: `calendarEvents(calendarId?)` → `CalendarEventsConnection`

---

### `event-get`

Get full details of a calendar event including reminders and recurrence exceptions.

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string (UUID)` | Yes      | Event ID    |

**GraphQL**: `calendarEventById(id)` with reminders and recurrenceExceptions fragments

---

### `event-create`

Create a new calendar event. Supports one-time and recurring events.

| Parameter        | Type                | Required | Description                                         |
| ---------------- | ------------------- | -------- | --------------------------------------------------- |
| `calendarId`     | `string (UUID)`     | Yes      | Calendar to add the event to                        |
| `title`          | `string`            | Yes      | Event title                                         |
| `startAt`        | `string (ISO 8601)` | Yes      | Start datetime (UTC)                                |
| `endAt`          | `string (ISO 8601)` | Yes      | End datetime (UTC)                                  |
| `timezone`       | `string`            | Yes      | IANA timezone (e.g., `America/Chicago`)             |
| `isAllDay`       | `boolean`           | No       | All-day event (default: false)                      |
| `description`    | `string`            | No       | Event description                                   |
| `location`       | `string`            | No       | Event location                                      |
| `recurrenceRule` | `string`            | No       | RFC 5545 RRULE (e.g., `FREQ=WEEKLY;BYDAY=MO,WE,FR`) |
| `eventTypeId`    | `string (UUID)`     | No       | Event type                                          |

**GraphQL**: `createCalendarEvent` mutation

---

### `event-update`

Update an existing calendar event.

| Parameter     | Type                | Required | Description     |
| ------------- | ------------------- | -------- | --------------- |
| `id`          | `string (UUID)`     | Yes      | Event ID        |
| `title`       | `string`            | No       | New title       |
| `startAt`     | `string (ISO 8601)` | No       | New start       |
| `endAt`       | `string (ISO 8601)` | No       | New end         |
| `description` | `string`            | No       | New description |
| `location`    | `string`            | No       | New location    |

**GraphQL**: `updateCalendarEvent` mutation

---

### `event-delete`

Delete a calendar event (soft-delete).

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string (UUID)` | Yes      | Event ID    |

**GraphQL**: `deleteCalendarEvent` mutation

---

### `events-for-range`

**Key tool** — List all events (including expanded recurring events) within a date range.

This is the primary tool for answering "What's on my calendar this week?" It calls the
`eventsForRange` GraphQL query which performs server-side recurrence expansion, returning
`ExpandedOccurrence` objects.

| Parameter     | Type                | Required | Description           |
| ------------- | ------------------- | -------- | --------------------- |
| `calendarIds` | `string[] (UUID[])` | Yes      | Calendar IDs to query |
| `rangeStart`  | `string (ISO 8601)` | Yes      | Range start (UTC)     |
| `rangeEnd`    | `string (ISO 8601)` | Yes      | Range end (UTC)       |
| `timezone`    | `string`            | Yes      | IANA timezone         |

**GraphQL**: `eventsForRange(calendarIds, rangeStart, rangeEnd, timezone)` → `[ExpandedOccurrence]`

**Example response**:

```text
Events for Mar 29 - Apr 5 (America/Chicago):

Mon Mar 31:
  09:00 - 09:30  Team Standup (Work Calendar)
  14:00 - 15:00  Project Review (Work Calendar)

Tue Apr 1:
  09:00 - 09:30  Team Standup (Work Calendar) [recurring]
  10:00 - 11:00  Dentist Appointment (Personal)

Wed Apr 2:
  09:00 - 09:30  Team Standup (Work Calendar) [recurring]
  All Day        Mom's Birthday (Birthdays)
```

---

## Task Domain

### `project-list`

List all projects, optionally filtered by space.

| Parameter | Type            | Required | Description     |
| --------- | --------------- | -------- | --------------- |
| `spaceId` | `string (UUID)` | No       | Filter by space |

**GraphQL**: `projects(spaceId?)` → `ProjectsConnection`

---

### `project-create`

Create a new project in a space.

| Parameter     | Type            | Required | Description           |
| ------------- | --------------- | -------- | --------------------- |
| `spaceId`     | `string (UUID)` | Yes      | Space for the project |
| `name`        | `string`        | Yes      | Project name          |
| `description` | `string`        | No       | Project description   |

**GraphQL**: `createProject` mutation

---

### `project-update`

Update a project's name or description.

| Parameter     | Type            | Required | Description     |
| ------------- | --------------- | -------- | --------------- |
| `id`          | `string (UUID)` | Yes      | Project ID      |
| `name`        | `string`        | No       | New name        |
| `description` | `string`        | No       | New description |

**GraphQL**: `updateProject` mutation

---

### `task-list`

List tasks with filters. Supports filtering by space, project, status, and priority.

| Parameter   | Type            | Required | Description                                        |
| ----------- | --------------- | -------- | -------------------------------------------------- |
| `spaceId`   | `string (UUID)` | No       | Filter by space                                    |
| `projectId` | `string (UUID)` | No       | Filter by project                                  |
| `status`    | `string`        | No       | Filter by status (e.g., `OPEN`, `COMPLETED`)       |
| `priority`  | `string`        | No       | Filter by priority (e.g., `HIGH`, `MEDIUM`, `LOW`) |
| `first`     | `number`        | No       | Page size (default: 25)                            |

**GraphQL**: `taskItems(spaceId?)` with `where` filters → `TaskItemsConnection`

---

### `task-get`

Get full task details including categories and attachments.

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string (UUID)` | Yes      | Task ID     |

**GraphQL**: `taskItemById(id)` with taskCategories and attachments fragments

---

### `task-create`

Create a new task.

| Parameter        | Type                  | Required | Description                        |
| ---------------- | --------------------- | -------- | ---------------------------------- |
| `spaceId`        | `string (UUID)`       | Yes      | Space for the task                 |
| `title`          | `string`              | Yes      | Task title                         |
| `description`    | `string`              | No       | Task description                   |
| `priority`       | `string`              | No       | Priority level                     |
| `status`         | `string`              | No       | Initial status                     |
| `projectId`      | `string (UUID)`       | No       | Assign to project                  |
| `dueAt`          | `string (ISO 8601)`   | No       | Due datetime                       |
| `dueDate`        | `string (YYYY-MM-DD)` | No       | Due date (date only)               |
| `recurrenceRule` | `string`              | No       | RFC 5545 RRULE for recurring tasks |

**GraphQL**: `createTaskItem` mutation

---

### `task-update`

Update a task's fields.

| Parameter     | Type                | Required | Description      |
| ------------- | ------------------- | -------- | ---------------- |
| `id`          | `string (UUID)`     | Yes      | Task ID          |
| `title`       | `string`            | No       | New title        |
| `description` | `string`            | No       | New description  |
| `priority`    | `string`            | No       | New priority     |
| `status`      | `string`            | No       | New status       |
| `dueAt`       | `string (ISO 8601)` | No       | New due datetime |

**GraphQL**: `updateTaskItem` mutation

---

### `task-complete`

Mark a task as completed.

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string (UUID)` | Yes      | Task ID     |

**GraphQL**: `completeTaskItem` mutation

---

### `task-delete`

Delete a task (soft-delete).

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string (UUID)` | Yes      | Task ID     |

**GraphQL**: `deleteTaskItem` mutation

---

### `task-assign-category`

Tag a task with a category.

| Parameter    | Type            | Required | Description |
| ------------ | --------------- | -------- | ----------- |
| `taskItemId` | `string (UUID)` | Yes      | Task ID     |
| `categoryId` | `string (UUID)` | Yes      | Category ID |

**GraphQL**: `assignCategory` mutation

---

### `task-remove-category`

Remove a category from a task.

| Parameter    | Type            | Required | Description |
| ------------ | --------------- | -------- | ----------- |
| `taskItemId` | `string (UUID)` | Yes      | Task ID     |
| `categoryId` | `string (UUID)` | Yes      | Category ID |

**GraphQL**: `removeCategory` mutation

---

## People Domain

### `person-list`

List people/contacts, optionally filtered by space.

| Parameter | Type            | Required | Description             |
| --------- | --------------- | -------- | ----------------------- |
| `spaceId` | `string (UUID)` | No       | Filter by space         |
| `first`   | `number`        | No       | Page size (default: 25) |

**GraphQL**: `persons(spaceId?)` → `PersonsConnection`

---

### `person-get`

Get full contact details including contact methods, addresses, and important dates.

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string (UUID)` | Yes      | Person ID   |

**GraphQL**: `personById(id)` with contactMethods, addresses, importantDates, attachments

**Example response**:

```text
Jane Smith (id: abc-123)
Space: Family

Contact Methods:
  - Phone (mobile, primary): +1-555-0123
  - Email (work): jane@company.com

Addresses:
  - Home (primary): 123 Main St, Springfield, IL 62701, US

Important Dates:
  - Birthday: March 15
  - Anniversary: June 22

Notes: Sister, lives in Springfield
```

---

### `person-create`

Create a new contact.

| Parameter   | Type            | Required | Description             |
| ----------- | --------------- | -------- | ----------------------- |
| `spaceId`   | `string (UUID)` | Yes      | Space for the contact   |
| `firstName` | `string`        | Yes      | First name              |
| `lastName`  | `string`        | Yes      | Last name               |
| `notes`     | `string`        | No       | Notes about this person |

**GraphQL**: `createPerson` mutation

---

### `person-update`

Update a person's name or notes.

| Parameter   | Type            | Required | Description    |
| ----------- | --------------- | -------- | -------------- |
| `id`        | `string (UUID)` | Yes      | Person ID      |
| `firstName` | `string`        | No       | New first name |
| `lastName`  | `string`        | No       | New last name  |
| `notes`     | `string`        | No       | New notes      |

**GraphQL**: `updatePerson` mutation

---

### `person-add-contact`

Add a contact method (phone, email, etc.) to a person.

| Parameter   | Type            | Required | Description                                 |
| ----------- | --------------- | -------- | ------------------------------------------- |
| `personId`  | `string (UUID)` | Yes      | Person ID                                   |
| `type`      | `string`        | Yes      | Contact type (e.g., `PHONE`, `EMAIL`)       |
| `value`     | `string`        | Yes      | Contact value (phone number, email address) |
| `label`     | `string`        | No       | Label (e.g., `work`, `mobile`, `home`)      |
| `isPrimary` | `boolean`       | No       | Set as primary (default: false)             |

**GraphQL**: `createContactMethod` mutation

---

### `person-add-address`

Add an address to a person.

| Parameter    | Type            | Required | Description                     |
| ------------ | --------------- | -------- | ------------------------------- |
| `personId`   | `string (UUID)` | Yes      | Person ID                       |
| `street1`    | `string`        | Yes      | Street line 1                   |
| `street2`    | `string`        | No       | Street line 2                   |
| `city`       | `string`        | Yes      | City                            |
| `state`      | `string`        | No       | State/province                  |
| `postalCode` | `string`        | No       | Postal/ZIP code                 |
| `country`    | `string`        | Yes      | Country                         |
| `label`      | `string`        | No       | Label (e.g., `home`, `work`)    |
| `isPrimary`  | `boolean`       | No       | Set as primary (default: false) |

**GraphQL**: `createAddress` mutation

---

### `person-add-date`

Add an important date (birthday, anniversary, etc.) to a person.

| Parameter     | Type                  | Required | Description                                  |
| ------------- | --------------------- | -------- | -------------------------------------------- |
| `personId`    | `string (UUID)`       | Yes      | Person ID                                    |
| `label`       | `string`              | Yes      | Date label (e.g., `Birthday`, `Anniversary`) |
| `dateValue`   | `string (YYYY-MM-DD)` | Yes      | The date                                     |
| `eventTypeId` | `string (UUID)`       | No       | Associated event type                        |

**GraphQL**: `createImportantDate` mutation

---

## Shopping Domain

### `shopping-list-list`

List all shopping lists, optionally filtered by space.

| Parameter | Type            | Required | Description     |
| --------- | --------------- | -------- | --------------- |
| `spaceId` | `string (UUID)` | No       | Filter by space |

**GraphQL**: `shoppingLists(spaceId?)` → `ShoppingListsConnection`

---

### `shopping-list-get`

Get a shopping list with all its items.

| Parameter | Type            | Required | Description      |
| --------- | --------------- | -------- | ---------------- |
| `id`      | `string (UUID)` | Yes      | Shopping list ID |

**GraphQL**: `shoppingListById(id)` with listItems fragment

**Example response**:

```text
Grocery Run (id: abc-123)
Space: Family
Items (7):
  [ ] Milk (qty: 1 gallon)
  [ ] Bread (qty: 2 loaves)
  [x] Eggs (qty: 1 dozen)
  [ ] Chicken breast (qty: 2 lbs)
  [ ] Rice (qty: 1 bag)
  [ ] Broccoli (qty: 2 heads)
  [x] Butter (qty: 1)
```

---

### `shopping-list-create`

Create a new shopping list.

| Parameter | Type            | Required | Description        |
| --------- | --------------- | -------- | ------------------ |
| `spaceId` | `string (UUID)` | Yes      | Space for the list |
| `name`    | `string`        | Yes      | List name          |

**GraphQL**: `createShoppingList` mutation

---

### `shopping-item-add`

Add an item to a shopping list.

| Parameter        | Type            | Required | Description                        |
| ---------------- | --------------- | -------- | ---------------------------------- |
| `shoppingListId` | `string (UUID)` | Yes      | List ID                            |
| `name`           | `string`        | Yes      | Item name                          |
| `quantity`       | `number`        | No       | Quantity                           |
| `unit`           | `string`        | No       | Unit (e.g., `lbs`, `oz`, `gallon`) |
| `sortOrder`      | `number`        | No       | Position in list                   |

**GraphQL**: `createListItem` mutation

---

### `shopping-item-update`

Update a shopping list item (check off, change quantity, etc.).

| Parameter   | Type            | Required | Description   |
| ----------- | --------------- | -------- | ------------- |
| `id`        | `string (UUID)` | Yes      | Item ID       |
| `name`      | `string`        | No       | New name      |
| `quantity`  | `number`        | No       | New quantity  |
| `unit`      | `string`        | No       | New unit      |
| `isChecked` | `boolean`       | No       | Check/uncheck |
| `sortOrder` | `number`        | No       | New position  |

**GraphQL**: `updateListItem` mutation

---

### `shopping-item-delete`

Remove an item from a shopping list.

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string (UUID)` | Yes      | Item ID     |

**GraphQL**: `deleteListItem` mutation

---

## Space Domain

### `space-list`

List all spaces the tenant has access to.

No parameters.

**GraphQL**: `spaces` → `SpacesConnection`

**Example response**:

```text
Spaces (3):
  - Personal (id: abc-123, type: personal, default)
  - Family (id: def-456, type: shared, 4 members)
  - Work Projects (id: ghi-789, type: shared, 2 members)
```

---

### `space-get`

Get space details with membership list.

| Parameter | Type            | Required | Description |
| --------- | --------------- | -------- | ----------- |
| `id`      | `string (UUID)` | Yes      | Space ID    |

**GraphQL**: `spaceById(id)` with memberships fragment

---

### `space-add-member`

Add a member to a space.

| Parameter | Type            | Required | Description                       |
| --------- | --------------- | -------- | --------------------------------- |
| `spaceId` | `string (UUID)` | Yes      | Space ID                          |
| `userId`  | `string (UUID)` | Yes      | User ID to add                    |
| `role`    | `string`        | Yes      | Role: `OWNER`, `EDITOR`, `VIEWER` |

**GraphQL**: `addSpaceMember` mutation

---

### `space-update-member-role`

Change a member's role in a space.

| Parameter | Type            | Required | Description                           |
| --------- | --------------- | -------- | ------------------------------------- |
| `spaceId` | `string (UUID)` | Yes      | Space ID                              |
| `userId`  | `string (UUID)` | Yes      | User ID                               |
| `role`    | `string`        | Yes      | New role: `OWNER`, `EDITOR`, `VIEWER` |

**GraphQL**: `updateSpaceMemberRole` mutation

---

## Sync Domain

### `sync-pull`

Pull recent changes from the Day Keeper sync protocol. Useful for "What changed recently?" queries.

| Parameter | Type            | Required | Description                                  |
| --------- | --------------- | -------- | -------------------------------------------- |
| `cursor`  | `number`        | No       | ChangeLog cursor (null for initial sync)     |
| `spaceId` | `string (UUID)` | No       | Filter changes by space                      |
| `limit`   | `number`        | No       | Max changes to return (1-1000, default: 100) |

**REST**: `POST /api/v1/sync/pull`

**Example response**:

```text
Changes since cursor 1523 (showing 3 of 3, no more):

1. CalendarEvent created (id: abc-123) at 2026-03-29T14:30:00Z
   Title: "Team Standup"
2. TaskItem updated (id: def-456) at 2026-03-29T14:35:00Z
   Status changed to COMPLETED
3. ListItem created (id: ghi-789) at 2026-03-29T15:00:00Z
   Added to shopping list "Grocery Run"

New cursor: 1526
```
