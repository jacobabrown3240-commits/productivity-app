/* ============================================================
   Nest — Notes, Lists & Reminders
   A single-file, no-build PWA. Everything lives in localStorage,
   so your data stays on your device and the app works offline.
   ============================================================ */
(function () {
  "use strict";

  // -----------------------------------------------------------
  // Storage
  // -----------------------------------------------------------
  var KEY = "nest.state.v1";
  var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Shopping categories, in the order they should appear when grouped.
  var CATEGORIES = [
    { id: "produce",   name: "Produce" },
    { id: "dairy",     name: "Dairy & eggs" },
    { id: "meat",      name: "Meat & fish" },
    { id: "bakery",    name: "Bakery" },
    { id: "frozen",    name: "Frozen" },
    { id: "pantry",    name: "Pantry" },
    { id: "drinks",    name: "Drinks" },
    { id: "household", name: "Household" },
    { id: "other",     name: "Other" }
  ];
  function catById(id) { for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i]; return null; }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // -----------------------------------------------------------
  // Inline SVG icons (monochrome, inherit currentColor)
  // -----------------------------------------------------------
  var ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    "bell-off": '<path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.9 17.9 0 0 1 18 8"/><path d="M6.26 6.26A5.9 5.9 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    "check-square": '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
    settings: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
    repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    grip: '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
    "chevron-left": '<polyline points="15 18 9 12 15 6"/>',
    "chevron-right": '<polyline points="9 18 15 12 9 6"/>'
  };
  var ICONS_FILLED = { grip: 1, pause: 1, flame: 1 };
  function ic(name, cls) {
    var filled = ICONS_FILLED[name];
    return '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" ' +
      (filled ? 'fill="currentColor" stroke="none"'
              : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"') +
      ' aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  // Colour palette for habit tiles (replaces emoji icons).
  var HABIT_COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#f97316"];
  function defaultState() {
    return {
      version: 1,
      reminders: [],
      lists: [
        {
          id: uid(),
          name: "Shopping",
          items: [
            { id: uid(), text: "Milk", qty: "", cat: "dairy", done: false },
            { id: uid(), text: "Eggs", qty: "", cat: "dairy", done: false },
            { id: uid(), text: "Bread", qty: "", cat: "bakery", done: false }
          ]
        }
      ],
      activeListId: null,
      checklists: [
        {
          id: uid(),
          title: "Weekly reset",
          recurring: "weekly",
          periodStamp: "",
          items: [
            { id: uid(), text: "Groceries", done: false },
            { id: uid(), text: "Laundry", done: false },
            { id: uid(), text: "Meal prep", done: false },
            { id: uid(), text: "Clean bathroom", done: false },
            { id: uid(), text: "Take out trash", done: false }
          ]
        },
        {
          id: uid(),
          title: "Every morning",
          recurring: "weekly",
          periodStamp: "",
          items: [
            { id: uid(), text: "Make the bed", done: false },
            { id: uid(), text: "Water intake", done: false },
            { id: uid(), text: "Plan the day", done: false }
          ]
        }
      ],
      habits: [
        { id: uid(), name: "Drink water", color: HABIT_COLORS[1], history: {}, created: Date.now() },
        { id: uid(), name: "Move / exercise", color: HABIT_COLORS[0], history: {}, created: Date.now() },
        { id: uid(), name: "Read", color: HABIT_COLORS[2], history: {}, created: Date.now() }
      ],
      reviews: {},
      notes: [
        {
          id: uid(),
          title: "Welcome to Nest",
          body: "This is your pocket notepad.\n\n• Jot anything here\n• Tap Today to capture stuff to remember\n• Track daily habits and build a streak\n• Turn on notifications up top so reminders can nudge you\n\nTap a note to edit it.",
          updated: Date.now()
        }
      ],
      settings: { theme: "dark" }
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      var s = JSON.parse(raw);
      // light migration / safety
      if (!s.reminders) s.reminders = [];
      if (!s.lists) s.lists = [];
      if (!s.checklists) s.checklists = [];
      if (!s.notes) s.notes = [];
      if (!s.habits) s.habits = [];
      if (!s.reviews) s.reviews = {};
      if (!s.settings) s.settings = { theme: "dark" };
      // backfill new per-item fields
      s.lists.forEach(function (l) {
        (l.items || []).forEach(function (it) {
          if (it.cat === undefined) it.cat = "";
          if (it.qty === undefined) it.qty = "";
        });
      });
      s.habits.forEach(function (h, i) {
        if (!h.history) h.history = {};
        if (!h.color) h.color = HABIT_COLORS[i % HABIT_COLORS.length];
      });
      return s;
    } catch (e) {
      return defaultState();
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  // Initialised after all constants above are defined (defaultState reads them).
  var state = load();

  // -----------------------------------------------------------
  // Date helpers
  // -----------------------------------------------------------
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function dateKey(d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayKey() { return dateKey(new Date()); }

  function weekStartKey(d) {
    d = d ? new Date(d) : new Date();
    d.setHours(0, 0, 0, 0);
    var day = d.getDay();               // 0 Sun .. 6 Sat
    var diff = (day + 6) % 7;           // days since Monday
    d.setDate(d.getDate() - diff);
    return dateKey(d);
  }

  function nowHM() {
    var d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function fmtTime(hm) {
    if (!hm) return "";
    var parts = hm.split(":");
    var h = parseInt(parts[0], 10);
    var m = parts[1];
    var ap = h < 12 ? "AM" : "PM";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ":" + m + " " + ap;
  }

  function fmtDate(key) {
    if (!key) return "";
    var p = key.split("-");
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    var tk = todayKey();
    if (key === tk) return "Today";
    var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    if (key === dateKey(tomorrow)) return "Tomorrow";
    var yest = new Date(); yest.setDate(yest.getDate() - 1);
    if (key === dateKey(yest)) return "Yesterday";
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  function relTime(ts) {
    var diff = Date.now() - ts;
    var mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    var hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    var days = Math.round(hrs / 24);
    if (days < 7) return days + "d ago";
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  // -----------------------------------------------------------
  // Small DOM utils
  // -----------------------------------------------------------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // -----------------------------------------------------------
  // Drag-to-reorder (pointer based — works with touch & mouse)
  // -----------------------------------------------------------
  function getDragAfter(container, y, dragging) {
    var els = Array.prototype.slice.call(container.children).filter(function (c) {
      return c !== dragging && c.hasAttribute("data-id");
    });
    var closest = { offset: -Infinity, el: null };
    els.forEach(function (child) {
      var box = child.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) closest = { offset: offset, el: child };
    });
    return closest.el;
  }

  function reorderArrayByIds(arr, ids) {
    var map = {};
    arr.forEach(function (o) { map[o.id] = o; });
    var res = [];
    ids.forEach(function (id) { if (map[id]) { res.push(map[id]); delete map[id]; } });
    arr.forEach(function (o) { if (map[o.id]) res.push(o); });   // keep any leftovers
    arr.length = 0;
    Array.prototype.push.apply(arr, res);
  }

  // container: element whose direct [data-id] children are reorderable.
  // arr: the backing model array (objects with matching .id).
  function makeSortable(container, arr) {
    if (!container) return;
    container.querySelectorAll("[data-drag]").forEach(function (handle) {
      handle.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        var dragging = handle.closest("[data-id]");
        if (!dragging) return;
        dragging.classList.add("dragging");
        container.classList.add("is-dragging");

        function onMove(ev) {
          if (ev.cancelable) ev.preventDefault();
          var after = getDragAfter(container, ev.clientY, dragging);
          if (after == null) container.appendChild(dragging);
          else container.insertBefore(dragging, after);
        }
        function onUp() {
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", onUp);
          dragging.classList.remove("dragging");
          container.classList.remove("is-dragging");
          var ids = Array.prototype.slice.call(container.children)
            .filter(function (c) { return c.hasAttribute("data-id"); })
            .map(function (c) { return c.getAttribute("data-id"); });
          reorderArrayByIds(arr, ids);
          save();
          render();
        }
        document.addEventListener("pointermove", onMove, { passive: false });
        document.addEventListener("pointerup", onUp);
        document.addEventListener("pointercancel", onUp);
      });
    });
  }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }

  // -----------------------------------------------------------
  // Modal
  // -----------------------------------------------------------
  function openModal(opts) {
    var backdrop = $("#modalBackdrop");
    $("#modalTitle").textContent = opts.title || "";
    $("#modalBody").innerHTML = opts.body || "";
    $("#modalFoot").innerHTML = opts.foot || "";
    backdrop.hidden = false;
    if (typeof opts.onMount === "function") opts.onMount($("#modalBody"), $("#modalFoot"));
  }
  function closeModal() { $("#modalBackdrop").hidden = true; }

  function confirmModal(title, message, o) {
    o = o || {};
    return new Promise(function (resolve) {
      openModal({
        title: title,
        body: '<p style="color:var(--text-dim);font-size:0.92rem;margin:2px 0 4px;">' + esc(message) + "</p>",
        foot: '<button class="btn btn-ghost" data-x="cancel">Cancel</button>' +
              '<button class="btn ' + (o.danger ? "btn-danger" : "btn-primary") + '" data-x="ok">' + esc(o.okLabel || "OK") + "</button>",
        onMount: function (body, foot) {
          foot.querySelector('[data-x="cancel"]').onclick = function () { closeModal(); resolve(false); };
          foot.querySelector('[data-x="ok"]').onclick = function () { closeModal(); resolve(true); };
        }
      });
    });
  }

  function promptText(title, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      openModal({
        title: title,
        body: '<label class="field"><span>' + esc(opts.label || "") + "</span>" +
              '<input type="text" id="pmInput" placeholder="' + esc(opts.placeholder || "") + '" value="' + esc(opts.value || "") + '"></label>',
        foot: '<button class="btn btn-ghost" data-x="cancel">Cancel</button>' +
              '<button class="btn btn-primary" data-x="ok">' + esc(opts.okLabel || "Save") + "</button>",
        onMount: function (body, foot) {
          var input = body.querySelector("#pmInput");
          input.focus();
          if (opts.value) input.select();
          function done() {
            var v = input.value.trim();
            if (!v) { input.focus(); return; }
            closeModal(); resolve(v);
          }
          input.onkeydown = function (e) { if (e.key === "Enter") done(); };
          foot.querySelector('[data-x="ok"]').onclick = done;
          foot.querySelector('[data-x="cancel"]').onclick = function () { closeModal(); resolve(null); };
        }
      });
    });
  }

  // -----------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------
  var currentView = "today";
  // Habits grid: which month is on screen, and the tracker's horizontal
  // scroll offset (-1 means "auto-centre on today" on the next render).
  var habitYear = new Date().getFullYear();
  var habitMonthIdx = new Date().getMonth();
  var habitScrollX = -1;
  var VIEW_META = {
    today:      { title: "Today",      sub: function () { return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }); } },
    habits:     { title: "Habits",     sub: function () { return "One grid, every habit, all month"; } },
    reminders:  { title: "Reminders",  sub: function () { return "One-off and weekly nudges"; } },
    shopping:   { title: "Shopping",   sub: function () { return "Lists for the store"; } },
    checklists: { title: "Checklists", sub: function () { return "Routines that reset each week"; } },
    notes:      { title: "Notes",      sub: function () { return "Your pocket notepad"; } }
  };

  function setView(view) {
    if (view === "habits" && currentView !== "habits") habitScrollX = -1;
    currentView = view;
    document.querySelectorAll(".view").forEach(function (v) { v.hidden = true; });
    $("#view-" + view).hidden = false;
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("is-active", t.getAttribute("data-view") === view);
    });
    var meta = VIEW_META[view];
    $("#viewTitle").textContent = meta.title;
    $("#viewSub").textContent = meta.sub();
    render();
    $("#content").scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // -----------------------------------------------------------
  // Reminders logic
  // -----------------------------------------------------------
  function reminderDueSort(a, b) {
    var ta = a.time || "99:99";
    var tb = b.time || "99:99";
    return ta < tb ? -1 : ta > tb ? 1 : 0;
  }

  // reminders that belong on the Today screen
  function todaysReminders() {
    var tk = todayKey();
    var wd = new Date().getDay();
    return state.reminders.filter(function (r) {
      if (r.kind === "weekly") return r.enabled !== false && r.weekday === wd;
      return r.date === tk;
    }).sort(reminderDueSort);
  }

  function isOverdue(r) {
    if (!r.time || r.done) return false;
    if (r.kind === "once" && r.date !== todayKey()) return r.date < todayKey();
    return r.time < nowHM();
  }

  // -----------------------------------------------------------
  // Checklist weekly reset
  // -----------------------------------------------------------
  function refreshChecklistPeriods() {
    var wk = weekStartKey();
    var changed = false;
    state.checklists.forEach(function (c) {
      if (c.recurring === "weekly" && c.periodStamp !== wk) {
        c.periodStamp = wk;
        c.items.forEach(function (it) { it.done = false; });
        changed = true;
      }
    });
    if (changed) save();
  }

  // -----------------------------------------------------------
  // Habits & streaks
  // -----------------------------------------------------------
  function habitDoneOn(h, key) { return !!(h.history && h.history[key]); }

  function addDays(key, n) {
    var p = key.split("-");
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    d.setDate(d.getDate() + n);
    return dateKey(d);
  }

  function currentStreak(h) {
    // Streak counts consecutive days ending today (if ticked) or yesterday
    // (today still counts as "not broken yet" until the day ends).
    var cursor = todayKey();
    if (!habitDoneOn(h, cursor)) {
      cursor = addDays(cursor, -1);
      if (!habitDoneOn(h, cursor)) return 0;
    }
    var streak = 0;
    while (habitDoneOn(h, cursor)) { streak++; cursor = addDays(cursor, -1); }
    return streak;
  }

  function toggleHabitDay(h, key) {
    if (!h.history) h.history = {};
    if (h.history[key]) delete h.history[key];
    else h.history[key] = true;
    save();
  }

  function renderHabits() {
    var el = $("#view-habits");
    var html = "";
    html += '<button class="btn btn-primary btn-block" data-act="add-habit" style="margin-bottom:14px">+ New habit</button>';

    if (state.habits.length === 0) {
      html += emptyBox("flame", "No habits yet", "Add one and fill in the grid day by day to build a streak.");
      el.innerHTML = html; return;
    }

    var now = new Date();
    var y = habitYear, m = habitMonthIdx;
    var dim = new Date(y, m + 1, 0).getDate();          // days in month
    var isThisMonth = (y === now.getFullYear() && m === now.getMonth());
    var isFutureMonth = (y > now.getFullYear()) || (y === now.getFullYear() && m > now.getMonth());
    var elapsed = isFutureMonth ? 0 : (isThisMonth ? now.getDate() : dim);
    var tk = todayKey();
    function keyFor(d) { return y + "-" + pad(m + 1) + "-" + pad(d); }

    // Completed check-ins this month (across every habit).
    var completed = 0;
    state.habits.forEach(function (h) {
      for (var d = 1; d <= dim; d++) if (habitDoneOn(h, keyFor(d))) completed++;
    });
    var possible = state.habits.length * elapsed;
    var pct = possible ? Math.round((completed / possible) * 1000) / 10 : 0;
    var monthLabel = new Date(y, m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

    // Month switcher
    html += '<div class="habit-monthbar">' +
      '<button class="month-nav" data-act="habit-prev-month" aria-label="Previous month">' + ic("chevron-left") + "</button>" +
      '<div class="habit-month-label">' + esc(monthLabel) + "</div>" +
      '<button class="month-nav" data-act="habit-next-month" aria-label="Next month">' + ic("chevron-right") + "</button>" +
      "</div>";

    // Summary strip
    html += '<div class="habit-summary">' +
      '<div class="hstat"><div class="n">' + state.habits.length + '</div><div class="l">habits</div></div>' +
      '<div class="hstat"><div class="n">' + completed + '</div><div class="l">check-ins</div></div>' +
      '<div class="hstat"><div class="n accent">' + pct + '%</div><div class="l">this month</div></div>' +
      "</div>";
    html += '<div class="habit-progress"><span style="width:' + pct + '%"></span></div>';

    // The grid: sticky habit column + one column per day of the month.
    html += '<div class="htrack"><div class="hgrid" style="--days:' + dim + '">';

    // Header row of day numbers
    html += '<div class="hrow hhead">';
    html += '<div class="hname hname-head">Habit</div>';
    for (var d = 1; d <= dim; d++) {
      var wd = new Date(y, m, d).getDay();
      var hk = keyFor(d);
      html += '<div class="hcell hhcell' + (wd === 0 || wd === 6 ? " wknd" : "") + (hk === tk ? " today" : "") + '">' +
        '<span class="hwd">' + WEEKDAYS_SHORT[wd][0] + '</span>' +
        '<span class="hdn">' + d + '</span></div>';
    }
    html += "</div>";

    // One row per habit
    html += '<div class="sortable hbody" id="habitSortable">';
    state.habits.forEach(function (h) {
      var color = esc(h.color || HABIT_COLORS[0]);
      var streak = currentStreak(h);
      html += '<div class="hrow" data-id="' + h.id + '">';
      html += '<div class="hname">' +
        '<span class="drag-handle" data-drag aria-label="Reorder">' + ic("grip") + "</span>" +
        '<button class="hname-btn" data-act="edit-habit" data-id="' + h.id + '">' +
          '<span class="hname-dot" style="background:' + color + '"></span>' +
          '<span class="hname-txt">' + esc(h.name) + "</span>" +
        "</button>" +
        (streak > 0 ? '<span class="hname-streak">' + ic("flame", "ic-sm") + streak + "</span>" : "") +
        "</div>";
      for (var d2 = 1; d2 <= dim; d2++) {
        var k = keyFor(d2);
        var on = habitDoneOn(h, k);
        var future = isFutureMonth || (isThisMonth && d2 > now.getDate());
        var style = on ? ' style="--hc:' + color + '"' : "";
        html += '<button class="hcell' + (on ? " on" : "") + (k === tk ? " today" : "") + (future ? " future" : "") + '"' +
          (future ? " disabled" : "") +
          ' data-act="toggle-habit-day" data-id="' + h.id + '" data-key="' + k + '"' + style +
          ' aria-label="' + esc(h.name) + ", " + monthLabel + " " + d2 + '"></button>';
      }
      html += "</div>";
    });
    html += "</div>";   // hbody
    html += "</div></div>";  // hgrid, htrack

    el.innerHTML = html;
    makeSortable($("#habitSortable"), state.habits);

    // Keep the horizontal scroll position stable between renders, and
    // centre on today the first time the grid appears for this month.
    var track = el.querySelector(".htrack");
    if (track) {
      if (habitScrollX < 0) {
        var todayCell = track.querySelector(".hhead .hcell.today");
        track.scrollLeft = todayCell
          ? Math.max(0, todayCell.offsetLeft - track.clientWidth / 2 + todayCell.offsetWidth / 2)
          : 0;
      } else {
        track.scrollLeft = habitScrollX;
      }
      habitScrollX = track.scrollLeft;
      track.addEventListener("scroll", function () { habitScrollX = track.scrollLeft; });
    }
  }

  function shiftHabitMonth(delta) {
    var d = new Date(habitYear, habitMonthIdx + delta, 1);
    habitYear = d.getFullYear();
    habitMonthIdx = d.getMonth();
    habitScrollX = -1;   // re-centre (on today if it's the current month)
    render();
  }

  function findHabit(id) { return state.habits.filter(function (h) { return h.id === id; })[0]; }

  function habitModal(existing) {
    var h = existing || { name: "", color: HABIT_COLORS[0] };
    var chosen = h.color || HABIT_COLORS[0];
    var body =
      '<label class="field"><span>Habit name</span>' +
      '<input type="text" id="hbName" placeholder="e.g. Meditate" value="' + esc(h.name) + '"></label>' +
      '<div class="field"><span style="display:block;font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;font-weight:600">Colour</span>' +
      '<div class="swatches" id="hbColor">' +
        HABIT_COLORS.map(function (c) {
          return '<button type="button" class="swatch ' + (c === chosen ? "is-active" : "") + '" data-c="' + c + '" style="background:' + c + '" aria-label="Colour"></button>';
        }).join("") +
      "</div></div>";
    var foot = (existing ? '<button class="btn btn-danger" data-x="del">Delete</button>' : "") +
      '<button class="btn btn-ghost" data-x="cancel">Cancel</button>' +
      '<button class="btn btn-primary" data-x="save">Save</button>';
    openModal({
      title: existing ? "Edit habit" : "New habit",
      body: body, foot: foot,
      onMount: function (b, f) {
        b.querySelector("#hbName").focus();
        b.querySelector("#hbColor").addEventListener("click", function (e) {
          var btn = e.target.closest("button[data-c]"); if (!btn) return;
          chosen = btn.getAttribute("data-c");
          b.querySelectorAll("#hbColor button").forEach(function (x) { x.classList.toggle("is-active", x === btn); });
        });
        f.querySelector('[data-x="cancel"]').onclick = closeModal;
        if (existing) f.querySelector('[data-x="del"]').onclick = function () {
          state.habits = state.habits.filter(function (x) { return x.id !== existing.id; });
          save(); closeModal(); render(); toast("Habit deleted");
        };
        f.querySelector('[data-x="save"]').onclick = function () {
          var name = b.querySelector("#hbName").value.trim();
          if (!name) { b.querySelector("#hbName").focus(); return; }
          if (existing) { existing.name = name; existing.color = chosen; }
          else state.habits.push({ id: uid(), name: name, color: chosen, history: {}, created: Date.now() });
          save(); closeModal(); render();
          toast(existing ? "Habit updated" : "Habit added");
        };
      }
    });
  }

  // -----------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------
  function render() {
    refreshChecklistPeriods();
    if (currentView === "today") renderToday();
    else if (currentView === "habits") renderHabits();
    else if (currentView === "reminders") renderReminders();
    else if (currentView === "shopping") renderShopping();
    else if (currentView === "checklists") renderChecklists();
    else if (currentView === "notes") renderNotes();
    updateBadges();
  }

  function updateBadges() {
    // count of not-done shopping items on active list
    var list = activeList();
    var shopCount = list ? list.items.filter(function (i) { return !i.done; }).length : 0;
    var due = todaysReminders().filter(function (r) { return !r.done; }).length;
    var habitsLeft = state.habits.filter(function (h) { return !habitDoneOn(h, todayKey()); }).length;
    setTabBadge("shopping", shopCount);
    setTabBadge("today", due);
    setTabBadge("habits", habitsLeft);
  }

  function setTabBadge(view, n) {
    var icon = document.querySelector('.tab[data-view="' + view + '"] .tab-ic');
    if (!icon) return;
    var badge = icon.querySelector(".count");
    if (n > 0) {
      icon.classList.add("tab-badge");
      if (!badge) { badge = document.createElement("span"); badge.className = "count"; icon.appendChild(badge); }
      badge.textContent = n > 99 ? "99+" : n;
    } else if (badge) {
      badge.remove();
    }
  }

  // ---------- TODAY ----------
  function agendaBucket(r) {
    if (r.done) return 3;
    if (r.time && isOverdue(r)) return 0;   // overdue first
    if (r.time) return 1;                   // upcoming timed
    return 2;                               // anytime
  }
  function agendaSort(a, b) {
    var ba = agendaBucket(a), bb = agendaBucket(b);
    if (ba !== bb) return ba - bb;
    var ta = a.time || "99:99", tb = b.time || "99:99";
    return ta < tb ? -1 : ta > tb ? 1 : 0;
  }

  function renderToday() {
    var el = $("#view-today");
    var tk = todayKey();
    var items = todaysReminders().slice().sort(agendaSort);
    var pending = items.filter(function (r) { return !r.done; });
    var overdue = pending.filter(function (r) { return r.time && isOverdue(r); });

    var html = "";

    // Permission banner
    if (supportsNotify() && Notification.permission === "default") {
      html += '<div class="banner" id="notifBanner">' +
        '<span class="banner-ic">' + ic("bell") + "</span>" +
        '<div class="banner-text"><b>Turn on reminders</b><small>Let Nest notify you when something is due.</small></div>' +
        '<button class="btn btn-primary btn-sm" data-act="ask-notify">Enable</button></div>';
    }

    // Quick capture
    html += '<div class="quick-add">' +
      '<input type="text" id="todayInput" placeholder="Remember today…" autocomplete="off">' +
      '<input type="time" id="todayTime" style="max-width:118px" aria-label="Time (optional)">' +
      '<button class="btn btn-primary" data-act="add-today">Add</button>' +
      '</div>';

    // Stats
    var cl = allTodayChecklistProgress();
    var habitsDone = state.habits.filter(function (h) { return habitDoneOn(h, tk); }).length;
    html += '<div class="stat-row">' +
      '<div class="stat"><div class="n accent">' + pending.length + '</div><div class="l">to remember</div></div>' +
      '<div class="stat" data-goto="habits" style="cursor:pointer"><div class="n">' + habitsDone + "/" + state.habits.length + '</div><div class="l">habits</div></div>' +
      '<div class="stat" data-goto="checklists" style="cursor:pointer"><div class="n">' + cl.done + "/" + cl.total + '</div><div class="l">checklist</div></div>' +
      '</div>';

    // Today's reminders
    html += '<div class="section-label">On the agenda' + (overdue.length ? ' · <span style="color:var(--danger)">' + overdue.length + " overdue</span>" : "") + "</div>";
    if (items.length === 0) {
      html += emptyBox("clock", "Nothing scheduled for today", "Add something above, or set a reminder.");
    } else {
      html += '<div class="card"><div class="rows">';
      items.forEach(function (r) { html += reminderRow(r, true); });
      html += "</div></div>";
    }

    // Coming up (future one-off reminders, soonest first)
    var upcoming = state.reminders.filter(function (r) {
      return r.kind === "once" && !r.done && r.date && r.date > tk;
    }).sort(function (a, b) {
      var ka = a.date + (a.time || "99:99"), kb = b.date + (b.time || "99:99");
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    }).slice(0, 4);
    if (upcoming.length) {
      html += '<div class="section-label">Coming up</div>';
      html += '<div class="card"><div class="rows">';
      upcoming.forEach(function (r) { html += reminderRow(r); });
      html += "</div></div>";
    }

    // Habits quick toggles
    if (state.habits.length) {
      html += '<div class="section-label">Habits today</div>';
      html += '<div class="card"><div class="rows">';
      state.habits.forEach(function (h) {
        var on = habitDoneOn(h, tk);
        var streak = currentStreak(h);
        html += '<div class="row">' +
          '<button class="check round ' + (on ? "done" : "") + '" data-act="toggle-habit-today" data-id="' + h.id + '"></button>' +
          '<span class="habit-dot" style="background:' + esc(h.color || HABIT_COLORS[0]) + '"></span>' +
          '<div class="row-body"><div class="row-text">' + esc(h.name) + "</div>" +
          (streak > 0 ? '<div class="row-meta"><span class="pill warn">' + ic("flame", "ic-sm") + " " + streak + " day" + (streak === 1 ? "" : "s") + "</span></div>" : "") +
          "</div></div>";
      });
      html += "</div></div>";
    }

    // Peek at checklists needing attention
    var openCl = state.checklists.filter(function (c) {
      return c.items.some(function (i) { return !i.done; });
    });
    if (openCl.length) {
      html += '<div class="section-label">Checklists</div>';
      openCl.slice(0, 3).forEach(function (c) {
        var total = c.items.length;
        var done = c.items.filter(function (i) { return i.done; }).length;
        var pct = total ? Math.round((done / total) * 100) : 0;
        html += '<div class="card" data-goto="checklists" style="cursor:pointer">' +
          '<div class="card-head"><div class="card-title">' + esc(c.title) + '</div>' +
          '<span class="pill">' + done + "/" + total + '</span></div>' +
          '<div class="progress"><span style="width:' + pct + '%"></span></div></div>';
      });
    }

    // Weekly review entry
    html += '<div class="section-label">This week</div>';
    html += '<div class="review-card" data-act="open-review">' +
      '<div class="rc-head"><span class="em">' + ic("calendar") + "</span><div>" +
      '<div class="rc-title">Weekly review</div>' +
      '<div class="rc-sub">See how your week went &amp; jot a reflection</div>' +
      "</div></div></div>";

    el.innerHTML = html;
  }

  function allTodayChecklistProgress() {
    var done = 0, total = 0;
    state.checklists.forEach(function (c) {
      c.items.forEach(function (i) { total++; if (i.done) done++; });
    });
    return { done: done, total: total };
  }

  function reminderRow(r, compact) {
    var overdue = isOverdue(r);
    var meta = [];
    if (r.kind === "weekly") meta.push('<span class="pill accent">Weekly · ' + WEEKDAYS_SHORT[r.weekday] + "</span>");
    else if (r.date && r.date !== todayKey()) meta.push('<span class="pill">' + fmtDate(r.date) + "</span>");
    if (r.time) meta.push('<span class="' + (overdue ? "pill danger" : "pill") + '">' + fmtTime(r.time) + (overdue ? " · due" : "") + "</span>");
    else meta.push('<span class="pill">Anytime</span>');

    var checkable = r.kind === "once" || compact;
    return '<div class="row ' + (r.done ? "done" : "") + '" data-rid="' + r.id + '">' +
      (checkable
        ? '<button class="check ' + (r.done ? "done" : "") + '" data-act="toggle-reminder" data-rid="' + r.id + '" aria-label="Done"></button>'
        : '<span class="row-lead">' + ic(r.enabled === false ? "pause" : "clock") + "</span>") +
      '<div class="row-body">' +
        '<div class="row-text">' + esc(r.text) + "</div>" +
        '<div class="row-meta">' + meta.join("") + "</div>" +
      "</div>" +
      '<div class="row-actions">' +
        '<button class="mini-btn" data-act="edit-reminder" data-rid="' + r.id + '" aria-label="Edit">' + ic("edit") + "</button>" +
        '<button class="mini-btn" data-act="del-reminder" data-rid="' + r.id + '" aria-label="Delete">' + ic("trash") + "</button>" +
      "</div></div>";
  }

  // ---------- REMINDERS ----------
  function renderReminders() {
    var el = $("#view-reminders");
    var html = "";
    html += '<button class="btn btn-primary btn-block" data-act="add-reminder" style="margin-bottom:14px">+ New reminder</button>';

    var once = state.reminders.filter(function (r) { return r.kind === "once"; })
      .sort(function (a, b) {
        var ka = (a.date || "") + (a.time || "");
        var kb = (b.date || "") + (b.time || "");
        return ka < kb ? -1 : ka > kb ? 1 : 0;
      });
    var weekly = state.reminders.filter(function (r) { return r.kind === "weekly"; })
      .sort(function (a, b) { return (a.weekday - b.weekday) || reminderDueSort(a, b); });

    html += '<div class="section-label">Weekly</div>';
    if (weekly.length === 0) html += emptyBox("repeat", "No weekly reminders yet", "Great for bin night, gym, calls home…");
    else { html += '<div class="card"><div class="rows">'; weekly.forEach(function (r) { html += reminderRow(r); }); html += "</div></div>"; }

    html += '<div class="section-label">One-off</div>';
    if (once.length === 0) html += emptyBox("calendar", "No one-off reminders", "Add appointments or things for a specific day.");
    else { html += '<div class="card"><div class="rows">'; once.forEach(function (r) { html += reminderRow(r); }); html += "</div></div>"; }

    html += '<p class="hint">Nest checks for due reminders while it’s open and when you reopen it. Keep it installed on your home screen and notifications on for the best nudges.</p>';
    el.innerHTML = html;
  }

  function reminderModal(existing) {
    var r = existing || { kind: "once", date: todayKey(), time: "", weekday: new Date().getDay(), text: "" };
    var isWeekly = r.kind === "weekly";
    var body =
      '<label class="field"><span>What should I remind you about?</span>' +
      '<input type="text" id="rmText" placeholder="e.g. Take the bins out" value="' + esc(r.text) + '"></label>' +
      '<div class="seg" id="rmKind" style="margin-bottom:12px">' +
        '<button data-k="once" class="' + (!isWeekly ? "is-active" : "") + '">One-off</button>' +
        '<button data-k="weekly" class="' + (isWeekly ? "is-active" : "") + '">Weekly</button>' +
      '</div>' +
      '<div id="rmOnce" ' + (isWeekly ? "hidden" : "") + '>' +
        '<label class="field"><span>Date</span><input type="date" id="rmDate" value="' + esc(r.date || todayKey()) + '"></label>' +
      '</div>' +
      '<div id="rmWeekly" ' + (!isWeekly ? "hidden" : "") + '>' +
        '<label class="field"><span>Day of week</span><select id="rmWeekday">' +
          WEEKDAYS.map(function (d, i) { return '<option value="' + i + '" ' + (i === r.weekday ? "selected" : "") + ">" + d + "</option>"; }).join("") +
        '</select></label>' +
      '</div>' +
      '<label class="field"><span>Time (leave empty for no alert)</span><input type="time" id="rmTime" value="' + esc(r.time || "") + '"></label>';

    var foot = (existing ? '<button class="btn btn-danger" data-x="del">Delete</button>' : "") +
      '<button class="btn btn-ghost" data-x="cancel">Cancel</button>' +
      '<button class="btn btn-primary" data-x="save">Save</button>';

    openModal({
      title: existing ? "Edit reminder" : "New reminder",
      body: body, foot: foot,
      onMount: function (b, f) {
        var kind = r.kind;
        b.querySelector("#rmKind").addEventListener("click", function (e) {
          var btn = e.target.closest("button[data-k]"); if (!btn) return;
          kind = btn.getAttribute("data-k");
          b.querySelectorAll("#rmKind button").forEach(function (x) { x.classList.toggle("is-active", x === btn); });
          b.querySelector("#rmOnce").hidden = kind !== "once";
          b.querySelector("#rmWeekly").hidden = kind !== "weekly";
        });
        b.querySelector("#rmText").focus();
        f.querySelector('[data-x="cancel"]').onclick = closeModal;
        if (existing) f.querySelector('[data-x="del"]').onclick = function () {
          state.reminders = state.reminders.filter(function (x) { return x.id !== existing.id; });
          save(); closeModal(); render(); toast("Reminder deleted");
        };
        f.querySelector('[data-x="save"]').onclick = function () {
          var text = b.querySelector("#rmText").value.trim();
          if (!text) { b.querySelector("#rmText").focus(); return; }
          var time = b.querySelector("#rmTime").value;
          var obj = existing || { id: uid(), done: false, enabled: true, created: Date.now(), lastFired: "" };
          obj.text = text; obj.kind = kind; obj.time = time;
          if (kind === "once") { obj.date = b.querySelector("#rmDate").value || todayKey(); obj.weekday = undefined; }
          else { obj.weekday = parseInt(b.querySelector("#rmWeekday").value, 10); obj.date = undefined; obj.done = false; }
          if (!existing) state.reminders.push(obj);
          save(); closeModal(); render();
          toast(existing ? "Reminder updated" : "Reminder set");
          maybeAskNotify();
        };
      }
    });
  }

  // ---------- SHOPPING ----------
  function activeList() {
    if (!state.lists.length) return null;
    var l = state.lists.filter(function (x) { return x.id === state.activeListId; })[0];
    return l || state.lists[0];
  }

  function renderShopping() {
    var el = $("#view-shopping");
    var list = activeList();
    var html = "";

    // list chips
    html += '<div class="chips">';
    state.lists.forEach(function (l) {
      html += '<button class="chip ' + (list && l.id === list.id ? "is-active" : "") + '" data-act="pick-list" data-lid="' + l.id + '">' + esc(l.name) + "</button>";
    });
    html += '<button class="chip add" data-act="add-list">+ List</button>';
    html += "</div>";

    if (!list) { el.innerHTML = html + emptyBox("bag", "No lists yet", "Create one to get started."); return; }

    var pending = list.items.filter(function (i) { return !i.done; });
    var done = list.items.filter(function (i) { return i.done; });

    html += '<div class="quick-add">' +
      '<input type="text" id="shopInput" placeholder="Add item…" autocomplete="off">' +
      '<input type="text" id="shopQty" class="qty-input" placeholder="Qty" autocomplete="off" aria-label="Quantity">' +
      '<button class="btn btn-primary" data-act="add-shop">Add</button></div>';

    html += '<div class="card-head" style="padding:0 2px 4px">' +
      '<div class="card-title" style="font-size:0.95rem">' + esc(list.name) + '</div>' +
      '<div class="row-actions">' +
        '<button class="mini-btn" data-act="rename-list" aria-label="Rename list">' + ic("edit") + "</button>" +
        (state.lists.length > 1 ? '<button class="mini-btn" data-act="del-list" aria-label="Delete list">' + ic("trash") + "</button>" : "") +
      '</div></div>';

    if (list.items.length === 0) {
      html += emptyBox("bag", "This list is empty", "Add your first item above.");
      el.innerHTML = html; return;
    }

    var anyCat = pending.some(function (i) { return i.cat; });
    if (!anyCat) {
      // Flat, drag-reorderable list
      html += '<div class="card"><div class="rows sortable" id="shopSortable">';
      pending.forEach(function (it) { html += shopRow(it, true); });
      html += "</div></div>";
    } else {
      // Grouped by category (drag disabled while grouped — categories do the sorting)
      CATEGORIES.forEach(function (cat) {
        var inCat = pending.filter(function (i) { return i.cat === cat.id; });
        if (!inCat.length) return;
        html += '<div class="cat-head">' + esc(cat.name) + "</div>";
        html += '<div class="card"><div class="rows">';
        inCat.forEach(function (it) { html += shopRow(it, false); });
        html += "</div></div>";
      });
      var uncat = pending.filter(function (i) { return !i.cat; });
      if (uncat.length) {
        html += '<div class="cat-head">Uncategorized</div>';
        html += '<div class="card"><div class="rows">';
        uncat.forEach(function (it) { html += shopRow(it, false); });
        html += "</div></div>";
      }
    }

    if (done.length) {
      html += '<div class="card-head" style="padding:0 2px 4px;margin-top:8px"><div class="card-sub" style="margin:0">In the cart · ' + done.length + '</div>' +
        '<button class="btn btn-ghost btn-sm" data-act="clear-done">Clear</button></div>';
      html += '<div class="card"><div class="rows">';
      done.forEach(function (it) { html += shopRow(it, false); });
      html += "</div></div>";
    }
    el.innerHTML = html;
    if (!anyCat) makeSortable($("#shopSortable"), list.items);
  }

  function shopRow(it, draggable) {
    return '<div class="row ' + (it.done ? "done" : "") + '" data-id="' + it.id + '">' +
      (draggable && !it.done ? '<span class="drag-handle" data-drag aria-label="Reorder">' + ic("grip") + "</span>" : "") +
      '<button class="check round ' + (it.done ? "done" : "") + '" data-act="toggle-shop" data-iid="' + it.id + '" aria-label="Got it"></button>' +
      '<div class="row-body"><div class="row-text">' + esc(it.text) +
        (it.qty ? ' <span class="pill qty-badge">×' + esc(it.qty) + "</span>" : "") + "</div></div>" +
      '<div class="row-actions">' +
        '<button class="mini-btn" data-act="edit-shop" data-iid="' + it.id + '" aria-label="Edit">' + ic("edit") + "</button>" +
        '<button class="mini-btn" data-act="del-shop" data-iid="' + it.id + '" aria-label="Remove">' + ic("x") + "</button>" +
      "</div></div>";
  }

  function shopItemModal(iid) {
    var list = activeList(); if (!list) return;
    var it = list.items.filter(function (i) { return i.id === iid; })[0]; if (!it) return;
    var chosenCat = it.cat || "";
    var body =
      '<label class="field"><span>Item</span><input type="text" id="siText" value="' + esc(it.text) + '"></label>' +
      '<label class="field"><span>Quantity (optional)</span><input type="text" id="siQty" placeholder="e.g. 2, 500g, 1 dozen" value="' + esc(it.qty || "") + '"></label>' +
      '<div class="field"><span style="display:block;font-size:0.8rem;color:var(--text-dim);margin-bottom:6px;font-weight:600">Aisle / category</span>' +
      '<div class="cat-picker" id="siCat">' +
        '<button type="button" class="cat-opt ' + (chosenCat === "" ? "is-active" : "") + '" data-c="">None</button>' +
        CATEGORIES.map(function (c) {
          return '<button type="button" class="cat-opt ' + (c.id === chosenCat ? "is-active" : "") + '" data-c="' + c.id + '">' + esc(c.name) + "</button>";
        }).join("") +
      "</div></div>";
    openModal({
      title: "Edit item", body: body,
      foot: '<button class="btn btn-ghost" data-x="cancel">Cancel</button><button class="btn btn-primary" data-x="save">Save</button>',
      onMount: function (b, f) {
        b.querySelector("#siCat").addEventListener("click", function (e) {
          var btn = e.target.closest("button[data-c]"); if (!btn) return;
          chosenCat = btn.getAttribute("data-c");
          b.querySelectorAll("#siCat button").forEach(function (x) { x.classList.toggle("is-active", x === btn); });
        });
        f.querySelector('[data-x="cancel"]').onclick = closeModal;
        f.querySelector('[data-x="save"]').onclick = function () {
          var text = b.querySelector("#siText").value.trim();
          if (!text) { b.querySelector("#siText").focus(); return; }
          it.text = text; it.qty = b.querySelector("#siQty").value.trim(); it.cat = chosenCat;
          save(); closeModal(); render();
        };
      }
    });
  }

  // ---------- CHECKLISTS ----------
  function renderChecklists() {
    var el = $("#view-checklists");
    var html = "";
    html += '<button class="btn btn-primary btn-block" data-act="add-checklist" style="margin-bottom:14px">+ New checklist</button>';

    if (state.checklists.length === 0) {
      html += emptyBox("check-square", "No checklists yet", "Build a weekly routine you can tick off.");
      el.innerHTML = html; return;
    }

    state.checklists.forEach(function (c) {
      var total = c.items.length;
      var done = c.items.filter(function (i) { return i.done; }).length;
      var pct = total ? Math.round((done / total) * 100) : 0;
      html += '<div class="card" data-cid="' + c.id + '">';
      html += '<div class="card-head"><div class="card-title">' + esc(c.title) +
        (c.recurring === "weekly" ? ' <span class="pill accent">Weekly</span>' : "") + "</div>" +
        '<div class="row-actions">' +
          '<button class="mini-btn" data-act="rename-checklist" data-cid="' + c.id + '" aria-label="Rename">' + ic("edit") + "</button>" +
          '<button class="mini-btn" data-act="del-checklist" data-cid="' + c.id + '" aria-label="Delete">' + ic("trash") + "</button>" +
        '</div></div>';
      html += '<div class="progress" style="margin-bottom:10px"><span style="width:' + pct + '%"></span></div>';
      html += '<div class="rows sortable" data-clsort="' + c.id + '">';
      c.items.forEach(function (it) {
        html += '<div class="row ' + (it.done ? "done" : "") + '" data-id="' + it.id + '">' +
          '<span class="drag-handle" data-drag aria-label="Reorder">' + ic("grip") + "</span>" +
          '<button class="check ' + (it.done ? "done" : "") + '" data-act="toggle-cl" data-cid="' + c.id + '" data-iid="' + it.id + '"></button>' +
          '<div class="row-body"><div class="row-text">' + esc(it.text) + "</div></div>" +
          '<div class="row-actions">' +
            '<button class="mini-btn" data-act="edit-cl-item" data-cid="' + c.id + '" data-iid="' + it.id + '" aria-label="Edit">' + ic("edit") + "</button>" +
            '<button class="mini-btn" data-act="del-cl-item" data-cid="' + c.id + '" data-iid="' + it.id + '" aria-label="Remove">' + ic("x") + "</button>" +
          "</div></div>";
      });
      html += "</div>";
      html += '<button class="btn-add-full" data-act="add-cl-item" data-cid="' + c.id + '" style="margin-top:10px">+ Add item</button>';
      if (c.recurring === "weekly" && done === total && total > 0) {
        html += '<p class="hint">All done — resets ' + fmtDate(nextWeekResetKey()) + ".</p>";
      }
      html += "</div>";
    });
    el.innerHTML = html;
    state.checklists.forEach(function (c) {
      makeSortable(el.querySelector('[data-clsort="' + c.id + '"]'), c.items);
    });
  }

  function nextWeekResetKey() {
    var d = new Date(weekStartKey());
    d.setDate(d.getDate() + 7);
    return dateKey(d);
  }

  function checklistModal(existing) {
    var c = existing || { title: "", recurring: "weekly" };
    var body =
      '<label class="field"><span>Checklist name</span>' +
      '<input type="text" id="clTitle" placeholder="e.g. Sunday reset" value="' + esc(c.title) + '"></label>' +
      '<label class="field"><span>Reset</span><select id="clRecurring">' +
        '<option value="weekly" ' + (c.recurring === "weekly" ? "selected" : "") + '>Every week (auto-uncheck)</option>' +
        '<option value="none" ' + (c.recurring === "none" ? "selected" : "") + '>Never (one-time list)</option>' +
      '</select></label>';
    var foot = (existing ? '<button class="btn btn-danger" data-x="del">Delete</button>' : "") +
      '<button class="btn btn-ghost" data-x="cancel">Cancel</button>' +
      '<button class="btn btn-primary" data-x="save">Save</button>';
    openModal({
      title: existing ? "Edit checklist" : "New checklist",
      body: body, foot: foot,
      onMount: function (b, f) {
        b.querySelector("#clTitle").focus();
        f.querySelector('[data-x="cancel"]').onclick = closeModal;
        if (existing) f.querySelector('[data-x="del"]').onclick = function () {
          state.checklists = state.checklists.filter(function (x) { return x.id !== existing.id; });
          save(); closeModal(); render(); toast("Checklist deleted");
        };
        f.querySelector('[data-x="save"]').onclick = function () {
          var title = b.querySelector("#clTitle").value.trim();
          if (!title) { b.querySelector("#clTitle").focus(); return; }
          var rec = b.querySelector("#clRecurring").value;
          if (existing) { existing.title = title; existing.recurring = rec; }
          else state.checklists.push({ id: uid(), title: title, recurring: rec, periodStamp: weekStartKey(), items: [] });
          save(); closeModal(); render();
          toast(existing ? "Checklist updated" : "Checklist created");
        };
      }
    });
  }

  // ---------- NOTES ----------
  function renderNotes() {
    var el = $("#view-notes");
    var html = "";
    html += '<button class="btn btn-primary btn-block" data-act="add-note" style="margin-bottom:14px">+ New note</button>';
    if (state.notes.length === 0) {
      html += emptyBox("file-text", "No notes yet", "Tap above to jot something down.");
      el.innerHTML = html; return;
    }
    var notes = state.notes.slice().sort(function (a, b) { return b.updated - a.updated; });
    html += '<div class="notes-grid">';
    notes.forEach(function (n) {
      var preview = (n.body || "").trim() || "…";
      html += '<div class="note-card" data-act="open-note" data-nid="' + n.id + '">' +
        "<h3>" + esc(n.title || "Untitled") + "</h3>" +
        "<p>" + esc(preview) + "</p>" +
        '<div class="note-date">' + relTime(n.updated) + "</div></div>";
    });
    html += "</div>";
    el.innerHTML = html;
  }

  function noteModal(existing) {
    var n = existing || { title: "", body: "" };
    var body =
      '<label class="field"><span>Title</span><input type="text" id="ntTitle" placeholder="Note title" value="' + esc(n.title) + '"></label>' +
      '<label class="field"><span>Note</span><textarea id="ntBody" placeholder="Write anything…" style="min-height:200px">' + esc(n.body) + "</textarea></label>";
    var foot = (existing ? '<button class="btn btn-danger" data-x="del">Delete</button>' : "") +
      '<button class="btn btn-ghost" data-x="cancel">Cancel</button>' +
      '<button class="btn btn-primary" data-x="save">Save</button>';
    openModal({
      title: existing ? "Edit note" : "New note",
      body: body, foot: foot,
      onMount: function (b, f) {
        if (!existing) b.querySelector("#ntTitle").focus();
        f.querySelector('[data-x="cancel"]').onclick = closeModal;
        if (existing) f.querySelector('[data-x="del"]').onclick = function () {
          state.notes = state.notes.filter(function (x) { return x.id !== existing.id; });
          save(); closeModal(); render(); toast("Note deleted");
        };
        f.querySelector('[data-x="save"]').onclick = function () {
          var title = b.querySelector("#ntTitle").value.trim();
          var bodyv = b.querySelector("#ntBody").value;
          if (!title && !bodyv.trim()) { closeModal(); return; }
          if (existing) { existing.title = title; existing.body = bodyv; existing.updated = Date.now(); }
          else state.notes.push({ id: uid(), title: title, body: bodyv, updated: Date.now() });
          save(); closeModal(); render(); toast("Saved");
        };
      }
    });
  }

  function emptyBox(iconName, title, sub) {
    return '<div class="empty"><span class="empty-ic">' + ic(iconName) + "</span><p><b>" + esc(title) + "</b></p><p>" + esc(sub) + "</p></div>";
  }

  // ---------- WEEKLY REVIEW ----------
  function reviewModal() {
    var wk = weekStartKey();
    var days = [];
    for (var i = 0; i < 7; i++) days.push(addDays(wk, i));
    var tk = todayKey();

    var habitChecks = 0;
    state.habits.forEach(function (h) { days.forEach(function (d) { if (habitDoneOn(h, d)) habitChecks++; }); });

    var clDone = 0, clTotal = 0;
    state.checklists.forEach(function (c) { c.items.forEach(function (it) { clTotal++; if (it.done) clDone++; }); });
    var clPct = clTotal ? Math.round((clDone / clTotal) * 100) : 0;

    var remDone = state.reminders.filter(function (r) {
      return r.kind === "once" && r.done && r.date >= wk && r.date <= addDays(wk, 6);
    }).length;

    var topStreak = 0, topName = "";
    state.habits.forEach(function (h) { var s = currentStreak(h); if (s > topStreak) { topStreak = s; topName = h.name; } });

    var review = state.reviews[wk] || { reflection: "" };

    var weekLabel = fmtDate(wk).replace("Today", new Date(wk.split("-")[0], wk.split("-")[1] - 1, wk.split("-")[2]).toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    var sunLabel = new Date(addDays(wk, 6).split("-")[0], addDays(wk, 6).split("-")[1] - 1, addDays(wk, 6).split("-")[2]).toLocaleDateString(undefined, { month: "short", day: "numeric" });

    var body =
      '<p class="rc-sub" style="margin:0 0 12px">Week of ' + esc(weekLabel) + " – " + esc(sunLabel) + "</p>" +
      '<div class="review-stats">' +
        '<div class="review-stat"><div class="n accent">' + habitChecks + '</div><div class="l">habit check-ins</div></div>' +
        '<div class="review-stat"><div class="n">' + remDone + '</div><div class="l">reminders done</div></div>' +
        '<div class="review-stat"><div class="n">' + clDone + "/" + clTotal + '</div><div class="l">checklist items (' + clPct + '%)</div></div>' +
        '<div class="review-stat"><div class="n" style="display:flex;align-items:center;gap:6px">' + ic("flame", "ic-lg flame-warn") + topStreak + '</div><div class="l">' + (topName ? "best streak · " + esc(topName) : "best streak") + '</div></div>' +
      "</div>" +
      '<label class="field"><span>Reflection — how did the week go?</span>' +
      '<textarea id="rvText" placeholder="Wins, what to improve, plans for next week…" style="min-height:120px">' + esc(review.reflection || "") + "</textarea></label>";
    openModal({
      title: "Weekly review",
      body: body,
      foot: '<button class="btn btn-ghost" data-x="close">Close</button><button class="btn btn-primary" data-x="save">Save reflection</button>',
      onMount: function (b, f) {
        f.querySelector('[data-x="close"]').onclick = closeModal;
        f.querySelector('[data-x="save"]').onclick = function () {
          state.reviews[wk] = { reflection: b.querySelector("#rvText").value, savedAt: Date.now() };
          save(); closeModal(); toast("Reflection saved");
        };
      }
    });
  }

  // -----------------------------------------------------------
  // Notifications
  // -----------------------------------------------------------
  function supportsNotify() { return "Notification" in window; }

  function updateNotifButton() {
    var btn = $("#notifBtn");
    if (!supportsNotify()) { btn.style.display = "none"; return; }
    var granted = Notification.permission === "granted";
    btn.classList.toggle("on", granted);
    btn.innerHTML = ic(granted ? "bell" : "bell-off");
    btn.title = granted ? "Reminders are on" : "Turn on notifications";
  }

  function maybeAskNotify() {
    if (supportsNotify() && Notification.permission === "default") askNotify();
  }

  function askNotify() {
    if (!supportsNotify()) { toast("Notifications aren’t supported on this device"); return; }
    if (Notification.permission === "granted") { toast("Reminders are already on"); return; }
    if (Notification.permission === "denied") { toast("Enable notifications in your browser settings"); return; }
    Notification.requestPermission().then(function (p) {
      updateNotifButton();
      if (p === "granted") { toast("Reminders on"); checkDue(); }
      else toast("No worries — you can turn these on later");
      render();
    });
  }

  function fireNotification(title, bodyText) {
    // Prefer the service worker registration so notifications persist / are clickable.
    if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(function (reg) {
        reg.showNotification(title, {
          body: bodyText || "",
          icon: "icons/icon-192.png",
          badge: "icons/icon-192.png",
          tag: "nest-reminder-" + title,
          vibrate: [80, 40, 80]
        });
      }).catch(function () { fallbackNotify(title, bodyText); });
    } else {
      fallbackNotify(title, bodyText);
    }
  }
  function fallbackNotify(title, bodyText) {
    try { new Notification(title, { body: bodyText || "", icon: "icons/icon-192.png" }); } catch (e) {}
  }

  // Check for reminders that are due and haven't been announced yet.
  function checkDue() {
    var tk = todayKey();
    var wd = new Date().getDay();
    var hm = nowHM();
    var fired = false;
    state.reminders.forEach(function (r) {
      if (!r.time) return;                 // no time = no alert
      var isToday, key;
      if (r.kind === "weekly") {
        if (r.enabled === false || r.weekday !== wd) return;
        isToday = true; key = tk;          // once per day
      } else {
        if (r.date !== tk || r.done) return;
        isToday = true; key = tk;
      }
      if (!isToday) return;
      if (r.time > hm) return;             // not due yet
      if (r.lastFired === key) return;     // already announced today
      r.lastFired = key;
      fired = true;
      if (supportsNotify() && Notification.permission === "granted") {
        fireNotification(r.text, "Reminder · " + (r.kind === "weekly" ? "Weekly" : fmtDate(r.date)));
      } else {
        toast("Reminder: " + r.text);
      }
    });
    if (fired) { save(); if (currentView === "today" || currentView === "reminders") render(); }
  }

  // -----------------------------------------------------------
  // Event handling (delegated)
  // -----------------------------------------------------------
  document.addEventListener("click", function (e) {
    var t = e.target;

    // tab bar
    var tab = t.closest(".tab");
    if (tab) { setView(tab.getAttribute("data-view")); return; }

    // goto card (Today -> checklists)
    var goto = t.closest("[data-goto]");
    if (goto && !t.closest("[data-act]")) { setView(goto.getAttribute("data-goto")); return; }

    var actEl = t.closest("[data-act]");
    if (!actEl) return;
    var act = actEl.getAttribute("data-act");

    switch (act) {
      case "ask-notify": askNotify(); break;

      // Today
      case "add-today": addTodayItem(); break;
      case "toggle-reminder": toggleReminder(actEl.getAttribute("data-rid")); break;
      case "edit-reminder": reminderModal(findReminder(actEl.getAttribute("data-rid"))); break;
      case "del-reminder": delReminder(actEl.getAttribute("data-rid")); break;

      // Reminders
      case "add-reminder": reminderModal(null); break;

      // Shopping
      case "pick-list": state.activeListId = actEl.getAttribute("data-lid"); save(); render(); break;
      case "add-list": addList(); break;
      case "rename-list": renameList(); break;
      case "del-list": delList(); break;
      case "add-shop": addShopItem(); break;
      case "toggle-shop": toggleShop(actEl.getAttribute("data-iid")); break;
      case "edit-shop": shopItemModal(actEl.getAttribute("data-iid")); break;
      case "del-shop": delShop(actEl.getAttribute("data-iid")); break;
      case "clear-done": clearShopDone(); break;

      // Habits
      case "habit-prev-month": shiftHabitMonth(-1); break;
      case "habit-next-month": shiftHabitMonth(1); break;
      case "add-habit": habitModal(null); break;
      case "edit-habit": habitModal(findHabit(actEl.getAttribute("data-id"))); break;
      case "del-habit": delHabit(actEl.getAttribute("data-id")); break;
      case "toggle-habit-today": toggleHabitDay(findHabit(actEl.getAttribute("data-id")), todayKey()); render(); break;
      case "toggle-habit-day": toggleHabitDay(findHabit(actEl.getAttribute("data-id")), actEl.getAttribute("data-key")); render(); break;

      // Weekly review
      case "open-review": reviewModal(); break;

      // Checklists
      case "add-checklist": checklistModal(null); break;
      case "rename-checklist": checklistModal(findChecklist(actEl.getAttribute("data-cid"))); break;
      case "del-checklist": delChecklist(actEl.getAttribute("data-cid")); break;
      case "toggle-cl": toggleClItem(actEl.getAttribute("data-cid"), actEl.getAttribute("data-iid")); break;
      case "add-cl-item": addClItem(actEl.getAttribute("data-cid")); break;
      case "edit-cl-item": editClItem(actEl.getAttribute("data-cid"), actEl.getAttribute("data-iid")); break;
      case "del-cl-item": delClItem(actEl.getAttribute("data-cid"), actEl.getAttribute("data-iid")); break;

      // Notes
      case "add-note": noteModal(null); break;
      case "open-note": noteModal(findNote(actEl.getAttribute("data-nid"))); break;
    }
  });

  // Enter-to-add on quick inputs
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    if (e.target.id === "todayInput" || e.target.id === "todayTime") addTodayItem();
    else if (e.target.id === "shopInput" || e.target.id === "shopQty") addShopItem();
  });

  // ---- finders ----
  function findReminder(id) { return state.reminders.filter(function (r) { return r.id === id; })[0]; }
  function findChecklist(id) { return state.checklists.filter(function (c) { return c.id === id; })[0]; }
  function findNote(id) { return state.notes.filter(function (n) { return n.id === id; })[0]; }

  // ---- Today actions ----
  function addTodayItem() {
    var input = $("#todayInput");
    var timeEl = $("#todayTime");
    if (!input) return;
    var text = input.value.trim();
    if (!text) { input.focus(); return; }
    var time = timeEl ? timeEl.value : "";
    state.reminders.push({
      id: uid(), text: text, kind: "once", date: todayKey(), time: time,
      done: false, enabled: true, created: Date.now(), lastFired: ""
    });
    save(); render();
    var ni = $("#todayInput"); if (ni) { ni.value = ""; ni.focus(); }
    var nt = $("#todayTime"); if (nt) nt.value = "";
    toast(time ? "Reminder set for " + fmtTime(time) : "Added to today");
    if (time) maybeAskNotify();
  }

  function toggleReminder(id) {
    var r = findReminder(id); if (!r) return;
    r.done = !r.done; save(); render();
  }
  function delReminder(id) {
    state.reminders = state.reminders.filter(function (r) { return r.id !== id; });
    save(); render(); toast("Deleted");
  }

  // ---- Shopping actions ----
  function addShopItem() {
    var input = $("#shopInput"); if (!input) return;
    var text = input.value.trim(); if (!text) { input.focus(); return; }
    var qtyEl = $("#shopQty");
    var qty = qtyEl ? qtyEl.value.trim() : "";
    var list = activeList(); if (!list) return;
    list.items.unshift({ id: uid(), text: text, qty: qty, cat: "", done: false });
    save(); render();
    var ni = $("#shopInput"); if (ni) { ni.value = ""; ni.focus(); }
    var nq = $("#shopQty"); if (nq) nq.value = "";
  }
  function toggleShop(iid) {
    var list = activeList(); if (!list) return;
    var it = list.items.filter(function (i) { return i.id === iid; })[0];
    if (it) { it.done = !it.done; save(); render(); }
  }
  function delShop(iid) {
    var list = activeList(); if (!list) return;
    list.items = list.items.filter(function (i) { return i.id !== iid; });
    save(); render();
  }
  function clearShopDone() {
    var list = activeList(); if (!list) return;
    list.items = list.items.filter(function (i) { return !i.done; });
    save(); render(); toast("Cleared checked items");
  }
  function addList() {
    promptText("New list", { label: "List name", placeholder: "e.g. Hardware store" }).then(function (name) {
      if (!name) return;
      var l = { id: uid(), name: name, items: [] };
      state.lists.push(l); state.activeListId = l.id; save(); render();
    });
  }
  function renameList() {
    var list = activeList(); if (!list) return;
    promptText("Rename list", { label: "List name", value: list.name }).then(function (name) {
      if (!name) return; list.name = name; save(); render();
    });
  }
  function delList() {
    var list = activeList(); if (!list || state.lists.length <= 1) return;
    confirmModal("Delete list?", "“" + list.name + "” and its items will be removed.", { danger: true, okLabel: "Delete" })
      .then(function (ok) {
        if (!ok) return;
        state.lists = state.lists.filter(function (l) { return l.id !== list.id; });
        state.activeListId = state.lists[0] ? state.lists[0].id : null;
        save(); render(); toast("List deleted");
      });
  }

  // ---- Checklist actions ----
  function toggleClItem(cid, iid) {
    var c = findChecklist(cid); if (!c) return;
    var it = c.items.filter(function (i) { return i.id === iid; })[0];
    if (it) { it.done = !it.done; save(); render(); }
  }
  function addClItem(cid) {
    var c = findChecklist(cid); if (!c) return;
    promptText("Add item", { label: "To “" + c.title + "”", placeholder: "New checklist item" }).then(function (txt) {
      if (!txt) return; c.items.push({ id: uid(), text: txt, done: false }); save(); render();
    });
  }
  function editClItem(cid, iid) {
    var c = findChecklist(cid); if (!c) return;
    var it = c.items.filter(function (i) { return i.id === iid; })[0]; if (!it) return;
    promptText("Edit item", { label: "Item text", value: it.text }).then(function (txt) {
      if (!txt) return; it.text = txt; save(); render();
    });
  }
  function delClItem(cid, iid) {
    var c = findChecklist(cid); if (!c) return;
    c.items = c.items.filter(function (i) { return i.id !== iid; });
    save(); render();
  }
  function delChecklist(cid) {
    var c = findChecklist(cid); if (!c) return;
    confirmModal("Delete checklist?", "“" + c.title + "” will be removed.", { danger: true, okLabel: "Delete" })
      .then(function (ok) {
        if (!ok) return;
        state.checklists = state.checklists.filter(function (x) { return x.id !== cid; });
        save(); render(); toast("Checklist deleted");
      });
  }

  function delHabit(id) {
    var h = findHabit(id); if (!h) return;
    confirmModal("Delete habit?", "“" + h.name + "” and its streak history will be removed.", { danger: true, okLabel: "Delete" })
      .then(function (ok) {
        if (!ok) return;
        state.habits = state.habits.filter(function (x) { return x.id !== id; });
        save(); render(); toast("Habit deleted");
      });
  }

  // -----------------------------------------------------------
  // Settings modal (theme, notifications, data export/import)
  // -----------------------------------------------------------
  function settingsModal() {
    var theme = (state.settings && state.settings.theme) || "dark";
    var notif = supportsNotify() ? (Notification.permission === "granted" ? "On" :
      Notification.permission === "denied" ? "Blocked" : "Off") : "Not supported";
    var body =
      '<label class="field"><span>Appearance</span>' +
      '<div class="seg" id="stTheme">' +
        '<button data-t="dark" class="' + (theme === "dark" ? "is-active" : "") + '">Dark</button>' +
        '<button data-t="light" class="' + (theme === "light" ? "is-active" : "") + '">Light</button>' +
      "</div></label>" +
      '<div class="field"><span style="display:block;font-size:0.8rem;color:var(--text-dim);margin-bottom:5px;font-weight:600">Reminders</span>' +
        '<div class="row" style="border:none;padding:4px 0"><div class="row-body"><div class="row-text">Notifications</div>' +
        '<div class="row-meta"><span class="pill">' + notif + "</span></div></div>" +
        '<button class="btn btn-sm btn-primary" data-x="notif">' + (notif === "On" ? "Test" : "Enable") + "</button></div></div>" +
      '<hr class="divider">' +
      '<div class="field"><span style="display:block;font-size:0.8rem;color:var(--text-dim);margin-bottom:5px;font-weight:600">Your data</span>' +
        '<div class="field-row"><button class="btn btn-sm" data-x="export">' + ic("download", "ic-sm") + ' Export</button>' +
        '<button class="btn btn-sm" data-x="import">' + ic("upload", "ic-sm") + ' Import</button></div>' +
        '<p class="hint">Everything is stored on this device only. Export a backup before switching phones.</p></div>' +
      '<button class="btn btn-danger btn-block btn-sm" data-x="reset" style="margin-top:6px">Reset all data</button>';
    openModal({
      title: "Settings", body: body,
      foot: '<button class="btn btn-primary btn-block" data-x="close">Done</button>',
      onMount: function (b, f) {
        b.querySelector("#stTheme").addEventListener("click", function (e) {
          var btn = e.target.closest("button[data-t]"); if (!btn) return;
          setTheme(btn.getAttribute("data-t"));
          b.querySelectorAll("#stTheme button").forEach(function (x) { x.classList.toggle("is-active", x === btn); });
        });
        var notifBtn = b.querySelector('[data-x="notif"]');
        if (notifBtn) notifBtn.onclick = function () {
          if (Notification.permission === "granted") { fireNotification("Nest test", "Notifications are working!"); }
          else askNotify();
        };
        b.querySelector('[data-x="export"]').onclick = exportData;
        b.querySelector('[data-x="import"]').onclick = importData;
        b.querySelector('[data-x="reset"]').onclick = function () {
          confirmModal("Reset everything?", "This deletes all notes, lists, checklists and reminders on this device.", { danger: true, okLabel: "Reset" })
            .then(function (ok) {
              if (!ok) return;
              state = defaultState(); save(); applyTheme(); closeModal(); setView("today"); toast("Fresh start");
            });
        };
        f.querySelector('[data-x="close"]').onclick = closeModal;
      }
    });
  }

  function exportData() {
    try {
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "nest-backup-" + todayKey() + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast("Backup downloaded");
    } catch (e) { toast("Export failed"); }
  }
  function importData() {
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = "application/json,.json";
    inp.onchange = function () {
      var file = inp.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data || typeof data !== "object") throw new Error("bad");
          state = data;
          if (!state.settings) state.settings = { theme: "dark" };
          save(); applyTheme(); closeModal(); setView("today"); toast("Data restored");
        } catch (e) { toast("Couldn’t read that file"); }
      };
      reader.readAsText(file);
    };
    inp.click();
  }

  // -----------------------------------------------------------
  // Theme
  // -----------------------------------------------------------
  function setTheme(theme) {
    state.settings.theme = theme; save(); applyTheme();
  }
  function applyTheme() {
    var theme = (state.settings && state.settings.theme) || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    var color = theme === "light" ? "#f4f6fb" : "#0b1220";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", color);
  }

  // -----------------------------------------------------------
  // Boot
  // -----------------------------------------------------------
  // Inject static SVG icons (header, tab bar, modal close).
  var brandMark = document.querySelector(".brand-mark");
  if (brandMark) brandMark.innerHTML = ic("check-square");
  $("#settingsBtn").innerHTML = ic("settings");
  $("#modalClose").innerHTML = ic("x");
  document.querySelectorAll(".tab").forEach(function (t) {
    var name = t.getAttribute("data-icon");
    var slot = t.querySelector(".tab-ic");
    if (name && slot) slot.innerHTML = ic(name);
  });

  $("#settingsBtn").addEventListener("click", settingsModal);
  $("#notifBtn").addEventListener("click", askNotify);
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", function (e) {
    if (e.target === $("#modalBackdrop")) closeModal();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  applyTheme();
  updateNotifButton();
  setView("today");
  checkDue();

  // Re-check reminders periodically and when the app regains focus.
  setInterval(checkDue, 30000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { render(); checkDue(); updateNotifButton(); } });
  window.addEventListener("focus", checkDue);

  // Register service worker for offline + notifications.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
