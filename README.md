# 🪺 Nest — Notes, Lists & Reminders

A pocket productivity app: a notepad, weekly checklists, shopping lists, and
reminders that nudge you at the right time. It's a companion to
[Budgie](https://github.com/jacobabrown3240-commits/Budgie) — same idea, no
accounts, no servers, everything stored on your device.

Nest is an installable **Progressive Web App (PWA)**. Open it in a browser,
"Add to Home Screen", and it behaves like a native app — working offline and
sending reminder notifications.

## What's inside

- **📌 Today** — a home dashboard: a quick box to capture "remember tonight /
  today" with an optional time (anything with a time notifies you), your
  agenda **sorted by what's due** (overdue first), a **Coming up** peek at the
  next few days, quick habit check-offs, checklist progress, and a link to your
  weekly review.
- **🔥 Habits** — track daily habits and build a **streak**. Tick today or any
  of the last 7 days, see your current and best streak, and pick an icon for
  each habit. Reorder them by dragging.
- **⏰ Reminders** — one-off reminders for a specific day *and* **weekly**
  recurring reminders (bin night, gym, call home). Pause, edit or delete any of
  them.
- **🛒 Shopping** — a shopping list you tick off as you go, with optional
  **quantities** and **categories/aisles** (Produce, Dairy, Frozen…). Items
  group by aisle automatically once you categorise them, or drag to reorder a
  flat list. Make as many named lists as you like and clear checked items in one
  tap.
- **✅ Checklists** — little routines that **auto-reset every week** so you start
  each week fresh. Add, rename, edit, delete and **drag to reorder** items. Two
  starters are included ("Weekly reset" and "Every morning").
- **📝 Notes** — a simple notepad for anything else.
- **📅 Weekly review** — a summary of your week (habit check-ins, reminders
  done, checklist completion, best streak) with a saved reflection for each
  week.

Extras: dark / light theme, one-tap **backup export/import** (JSON), tab badges
for what needs attention, and drag-to-reorder throughout.

## Notifications — how they work

Nest has **no server**, so reminders are checked by the app itself:

- While the app is open (or freshly reopened), it checks every 30 seconds and
  fires a notification for anything that's due.
- If a reminder's time passed while the app was closed, you'll get it the next
  time you open Nest.
- For the most reliable nudges, **install it to your home screen** and allow
  notifications when asked (tap the 🔔 in the top bar).

> On iPhone, web-app notifications require iOS 16.4+ and the app must be added
> to the Home Screen first.

## Run it

It's plain HTML/CSS/JS with no build step.

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Or host the folder on any static host (GitHub Pages works great).

## Your data

Everything lives in your browser's `localStorage` on this device only. Use
**Settings → Export** to save a backup before switching phones, and **Import**
to restore it.

## Ideas for later

Shared/synced lists, habit reminders at a set time, recurring one-off
reminders, monthly/yearly habit calendars, and search across notes are all
natural next steps — the code is organised so each feature is easy to extend.
