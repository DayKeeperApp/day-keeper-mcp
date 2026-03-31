# Prompt Catalog

Complete reference for all MCP prompts provided by the Day Keeper MCP server.

Prompts are reusable interaction templates that fetch live data from the Day Keeper API and
construct structured messages for LLM interactions.

---

## `daily-planning`

Plan your day with your calendar events and open tasks.

### Arguments

| Argument | Type                  | Required | Default | Description      |
| -------- | --------------------- | -------- | ------- | ---------------- |
| `date`   | `string (YYYY-MM-DD)` | No       | Today   | Date to plan for |

### Data Fetched

1. Calendar events for the specified date via `eventsForRange`
2. Open tasks due on or before the date via `taskItems` with status/due filters

### Example Rendered Output

```text
Here is your schedule and open tasks for Saturday, March 29, 2026:

## Calendar Events

09:00 - 09:30  Team Standup (Work Calendar)
11:00 - 12:00  Product Review (Work Calendar)
14:00 - 15:00  Dentist Appointment (Personal)

## Open Tasks (due today or overdue)

HIGH:
  - [ ] Submit Q1 report (due today, project: Q2 Launch)
  - [ ] Review PR #234 (overdue by 1 day)

MEDIUM:
  - [ ] Update API documentation (due today)
  - [ ] Order birthday gift for Mom (due Apr 2)

LOW:
  - [ ] Clean up test fixtures (no due date)

---

Please help me plan my day. Consider:
- Are there any scheduling conflicts?
- Which tasks should I prioritize?
- When should I block time for focused work?
- Is there anything I should reschedule?
```

---

## `weekly-review`

Review the week's accomplishments and plan ahead.

### Arguments

| Argument    | Type                  | Required | Default            | Description                 |
| ----------- | --------------------- | -------- | ------------------ | --------------------------- |
| `weekStart` | `string (YYYY-MM-DD)` | No       | Most recent Monday | Start of the week to review |

### Data Fetched

1. All calendar events for the week via `eventsForRange`
2. Tasks completed during the week
3. Tasks still open (carried forward)

### Example Rendered Output

```text
Here is your week in review (Mar 24 - Mar 30, 2026):

## Events Attended (12)
  Mon: Team Standup, Sprint Planning
  Tue: Team Standup, 1:1 with Manager
  Wed: Team Standup, Design Review
  Thu: Team Standup, All-Hands
  Fri: Team Standup, Retrospective
  Sat: Grocery Shopping, Soccer Practice

## Tasks Completed (8)
  - Fix login redirect bug (Q2 Launch)
  - Update deployment scripts (Tech Debt)
  - Write unit tests for sync client (Q2 Launch)
  - ... and 5 more

## Tasks Still Open (15)
  HIGH (3):
    - Submit Q1 report (due Mar 29)
    - Review PR #234 (due Mar 28, overdue)
    - Finalize API docs (due Apr 5)
  MEDIUM (7): ...
  LOW (5): ...

## Upcoming Next Week
  Key events: Sprint Demo (Mon), Team Offsite (Thu-Fri)
  Tasks due: 4 high-priority, 6 medium

---

Please help me review my week:
- What went well? What patterns do you notice?
- Which overdue items need immediate attention?
- How should I prioritize next week?
- Any tasks I should delegate or defer?
```

---

## `meeting-prep`

Prepare for a specific meeting with context and attendees.

### Arguments

| Argument  | Type            | Required | Default | Description                      |
| --------- | --------------- | -------- | ------- | -------------------------------- |
| `eventId` | `string (UUID)` | Yes      | —       | Calendar event ID to prepare for |

### Data Fetched

1. Full event details via `calendarEventById`
2. Related people (if attendees are stored as contacts)
3. Recent tasks from the same project (if event is project-related)

### Example Rendered Output

```text
## Meeting Prep: Product Review

When: Monday, March 31 at 11:00 AM - 12:00 PM (America/Chicago)
Location: Conference Room A
Calendar: Work Calendar

Description:
  Monthly product review with the engineering team.
  Review Q1 progress and Q2 planning.

Related Contacts:
  - Sarah Chen (Engineering Manager) — sarah@company.com
  - Mike Johnson (Product Lead) — mike@company.com

Recent Project Activity (Q2 Launch):
  - 3 tasks completed this week
  - 5 tasks in progress
  - 2 tasks blocked

---

Please help me prepare for this meeting:
- What key points should I bring up?
- Are there any blockers I should raise?
- What questions should I prepare for?
- Any action items from context that need follow-up?
```

---

## `shopping-assistant`

Build and manage a shopping list interactively.

### Arguments

| Argument | Type            | Required | Default | Description                                  |
| -------- | --------------- | -------- | ------- | -------------------------------------------- |
| `listId` | `string (UUID)` | No       | —       | Existing list to modify (omit to create new) |

### Data Fetched

1. If `listId` provided: existing list with items via `shoppingListById`
2. Available spaces for new list creation

### Example Rendered Output (existing list)

```text
## Shopping List: Grocery Run

Current items (7, 2 checked):
  [ ] Milk (qty: 1 gallon)
  [ ] Bread (qty: 2 loaves)
  [x] Eggs (qty: 1 dozen)
  [ ] Chicken breast (qty: 2 lbs)
  [ ] Rice (qty: 1 bag)
  [ ] Broccoli (qty: 2 heads)
  [x] Butter (qty: 1)

---

I can help you manage this shopping list. You can:
- Add items: "Add 3 apples and a bag of flour"
- Check off items: "Check off milk and bread"
- Remove items: "Remove the rice"
- Suggest items: "What else do I need for chicken stir-fry?"

What would you like to do?
```

### Example Rendered Output (new list)

```text
Let's create a new shopping list!

Available spaces:
  - Personal (id: abc-123)
  - Family (id: def-456)

---

Tell me:
1. What should we name this list? (e.g., "Grocery Run", "Party Supplies")
2. Which space should it belong to?
3. What items should we start with?

You can also describe a meal plan and I'll generate the shopping items.
```

---

## `contact-lookup`

Find and summarize contact details by name.

### Arguments

| Argument | Type     | Required | Default | Description                               |
| -------- | -------- | -------- | ------- | ----------------------------------------- |
| `name`   | `string` | Yes      | —       | Name to search for (first, last, or full) |

### Data Fetched

1. People matching the name via `persons` with name filter
2. Full details for matches via `personById`

### Example Rendered Output

```text
## Contact Lookup: "Smith"

Found 2 matches:

### Jane Smith (id: person-001, Family space)
  Phone: +1-555-0123 (mobile, primary)
  Email: jane@company.com (work)
  Email: jane.smith@gmail.com (personal)
  Address: 123 Main St, Springfield, IL 62701
  Birthday: March 15
  Anniversary: June 22
  Notes: Sister, lives in Springfield

### Bob Smith (id: person-002, Family space)
  Phone: +1-555-0456 (mobile, primary)
  Email: bob@example.com (personal)
  Birthday: August 3
  Notes: Brother-in-law

---

Would you like to:
- Update a contact's details?
- Add a new contact method or address?
- Create a calendar event related to one of these contacts?
```

---

## `upcoming-birthdays`

Check for upcoming important dates in your contacts.

### Arguments

| Argument    | Type     | Required | Default | Description                  |
| ----------- | -------- | -------- | ------- | ---------------------------- |
| `daysAhead` | `number` | No       | `30`    | Number of days to look ahead |

### Data Fetched

1. All people across spaces via `persons`
2. Filter important dates that fall within the window

### Example Rendered Output

```text
## Upcoming Important Dates (next 30 days)

### This Week (Mar 29 - Apr 4)
  - Apr 2: Mom's Birthday (Jane Smith, Family) — in 4 days!
  - Apr 3: Wedding Anniversary (Mike & Lisa Johnson, Friends) — in 5 days

### Next Week (Apr 5 - Apr 11)
  - Apr 8: Dad's Birthday (Bob Smith, Family) — in 10 days

### Later (Apr 12 - Apr 28)
  - Apr 15: Best Friend's Birthday (Alex Chen, Friends) — in 17 days
  - Apr 22: Nephew's Birthday (Tim Smith, Family) — in 24 days

---

Would you like to:
- Create a reminder event for any of these dates?
- Look up contact details to send a card or message?
- Add a gift idea to your tasks?
```
