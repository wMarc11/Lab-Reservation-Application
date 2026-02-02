/*
  My Reservations (prototype)

  - Stores reservations in localStorage under: labynx_reservations_v1
  - Implements View + Edit Reservation with basic validation and conflict checks.
  - Uses RegEx for searching.
  - IMPORTANT: LABS array to be replaced with NoSql query, it's there for the MCO1 demo.
*/

(function () {
  const STORAGE_KEY = "labynx_reservations_v1";
  const loggedInUserID = "12345678"; // placeholder until auth is implemented

  const LABS = ["GK301", "GK302A", "GK302B"];
  const LAB_CAPACITY = {
    GK301: 20,
    GK302A: 20,
    GK302B: 20,
  };

  const els = {
    tbody: document.getElementById("reservations-tbody"),
    emptyState: document.getElementById("empty-state"),

    statUpcoming: document.getElementById("stat-upcoming"),
    statToday: document.getElementById("stat-today"),
    statTotal: document.getElementById("stat-total"),
    statUpcomingBadge: document.getElementById("stat-upcoming-badge"),
    statTodayBadge: document.getElementById("stat-today-badge"),
    statTotalBadge: document.getElementById("stat-total-badge"),
    statCancelled: document.getElementById("stat-cancelled"),
    statCancelledBadge: document.getElementById("stat-cancelled-badge"),

    filterLab: document.getElementById("filter-lab"),
    filterStatus: document.getElementById("filter-status"),
    filterSearch: document.getElementById("filter-search"),

    // modal
    overlay: document.getElementById("modal-overlay"),
    modalClose: document.getElementById("modal-close"),
    tabView: document.getElementById("tab-view"),
    tabEdit: document.getElementById("tab-edit"),
    viewPane: document.getElementById("view-pane"),
    modalViewGrid: document.getElementById("modal-view-grid"),
    editForm: document.getElementById("edit-form"),
    formError: document.getElementById("form-error"),
    btnCancel: document.getElementById("btn-cancel"),

    // form fields
    editId: document.getElementById("edit-id"),
    editLab: document.getElementById("edit-lab"),
    editDate: document.getElementById("edit-date"),
    editSeat: document.getElementById("edit-seat"),
    editStart: document.getElementById("edit-start"),
    editEnd: document.getElementById("edit-end"),
    editAnon: document.getElementById("edit-anon"),
    seatHint: document.getElementById("seat-hint"),
  };

  let reservations = [];
  let activeReservationId = null;

  // ---------- Helpers ----------
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toISODate(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function addDays(d, n) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  }

  function formatDateLabel(isoDate) {
    const today = toISODate(new Date());
    const tomorrow = toISODate(addDays(new Date(), 1));

    if (isoDate === today) return "Today";
    if (isoDate === tomorrow) return "Tomorrow";
    return isoDate;
  }

  function minutesFromHHMM(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function hhmmFromMinutes(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${pad2(h)}:${pad2(m)}`;
  }

  function overlaps(aStart, aEnd, bStart, bEnd) {
    // intervals overlap if start < otherEnd AND end > otherStart
    return aStart < bEnd && aEnd > bStart;
  }

  function statusFor(res) {
    if (res.cancelled) return "CANCELLED";
    const todayISO = toISODate(new Date());
    const resDate = res.date;
    if (resDate === todayISO) return "TODAY";
    if (resDate > todayISO) return "UPCOMING";
    return "PAST";
  }

  function prettyStatus(status) {
    if (status === "UPCOMING") return "Upcoming";
    if (status === "TODAY") return "Today";
    if (status === "PAST") return "Past";
    return "Cancelled";
  }

  function badgeClass(status) {
    if (status === "UPCOMING") return "upcoming";
    if (status === "TODAY") return "today";
    if (status === "PAST") return "past";
    return "cancelled";
  }

  function visibilityLabel(res) {
    return res.anonymous ? "Anonymous" : "Public";
  }

  function newId() {
    let id = "";
    do {
      const ts = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
      id = `R-${ts}${rand}`;
    } while (reservations && reservations.some(r => r.id === id));
    return id;
  }

  function setHidden(el, hidden) {
    if (!el) return;
    el.hidden = !!hidden;
  }

  function setTab(which) {
    const viewActive = which === "view";
    els.tabView.classList.toggle("tab-active", viewActive);
    els.tabEdit.classList.toggle("tab-active", !viewActive);
    setHidden(els.viewPane, !viewActive);
    setHidden(els.editForm, viewActive);
    setHidden(els.formError, true);
  }

  function closeModal() {
    els.overlay.classList.remove("is-open");
    setHidden(els.overlay, true);
    document.body.classList.remove("modal-open");
    activeReservationId = null;
  }

  function openModal(resId, mode) {
    activeReservationId = resId;
    const res = reservations.find(r => r.id === resId);
    if (!res) return;

    const stat = statusFor(res);
    const viewItems = [
      { label: "Reservation ID", value: res.id },
      { label: "Laboratory", value: res.lab },
      { label: "Date", value: formatDateLabel(res.date) },
      { label: "Time", value: `${res.startTime} - ${res.endTime}` },
      { label: "Seat", value: String(res.seat) },
      { label: "Visibility", value: visibilityLabel(res) },
      { label: "Status", value: prettyStatus(stat) },
    ];

    els.modalViewGrid.innerHTML = viewItems
      .map(i => `<div class="detail-item"><span>${i.label}</span><b>${i.value}</b></div>`)
      .join("");

    // Fill edit form
    els.editId.value = res.id;
    els.editLab.value = res.lab;
    els.editDate.value = res.date;
    els.editSeat.value = res.seat;
    els.editStart.value = res.startTime;
    els.editEnd.value = res.endTime;
    els.editAnon.checked = !!res.anonymous;
    els.seatHint.textContent = `Seat must be within ${res.lab} capacity (${LAB_CAPACITY[res.lab]}).`;

    // Ensure end times are valid vs start
    syncEndTimes();

    setHidden(els.overlay, false);
    els.overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    setTab(mode === "edit" ? "edit" : "view");
  }

  function buildTimeOptions(selectEl) {
    // 07:00 to 21:00 in 30-min steps (adjust freely)
    const startMin = 7 * 60;
    const endMin = 21 * 60;

    let html = "";
    for (let t = startMin; t <= endMin; t += 30) {
      const v = hhmmFromMinutes(t);
      html += `<option value="${v}">${v}</option>`;
    }
    selectEl.innerHTML = html;
  }

  function syncEndTimes() {
    // Ensure end time is always > start time.
    const s = minutesFromHHMM(els.editStart.value);
    const e = minutesFromHHMM(els.editEnd.value);

    // Rebuild end options and disable those <= start
    const options = Array.from(els.editEnd.options);
    options.forEach(opt => {
      const mins = minutesFromHHMM(opt.value);
      opt.disabled = mins <= s;
    });

    if (e <= s) {
      // pick next available
      const next = options.find(opt => !opt.disabled);
      if (next) els.editEnd.value = next.value;
    }
  }

  function validateAndSaveEdit(evt) {
    evt.preventDefault();
    setHidden(els.formError, true);

    const id = els.editId.value;
    const res = reservations.find(r => r.id === id);
    if (!res) return;

    const lab = res.lab;
    const date = els.editDate.value;
    const seat = Number(els.editSeat.value);
    const startTime = els.editStart.value;
    const endTime = els.editEnd.value;
    const anonymous = els.editAnon.checked;

    // Basic checks
    if (!date || !startTime || !endTime || !Number.isFinite(seat)) {
      return showError("Please complete all required fields.");
    }

    const today = new Date();
    const minDate = toISODate(today);
    const maxDate = toISODate(addDays(today, 7));

    if (date < minDate || date > maxDate) {
      return showError("Date must be within the next 7 days (prototype rule).");
    }

    const capacity = LAB_CAPACITY[lab] ?? 20;
    if (seat < 1 || seat > capacity) {
      return showError(`Seat must be between 1 and ${capacity} for ${lab}.`);
    }

    const sMin = minutesFromHHMM(startTime);
    const eMin = minutesFromHHMM(endTime);

    if (eMin <= sMin) {
      return showError("End time must be after start time.");
    }
    if ((eMin - sMin) % 30 !== 0) {
      return showError("Time must be in 30-minute intervals.");
    }

    // Conflict check against other reservations (same lab, same seat, same date)
    const conflict = reservations.some(other => {
      if (other.id === id) return false;
      if (other.cancelled) return false;
      if (other.lab !== lab) return false;
      if (other.date !== date) return false;
      if (Number(other.seat) !== seat) return false;

      const oS = minutesFromHHMM(other.startTime);
      const oE = minutesFromHHMM(other.endTime);
      return overlaps(sMin, eMin, oS, oE);
    });

    if (conflict) {
      return showError("That seat and time overlaps an existing reservation (prototype check).");
    }

    // Save
    res.date = date;
    res.seat = seat;
    res.startTime = startTime;
    res.endTime = endTime;
    res.anonymous = anonymous;

    persist();
    render();
openModal(id, "view"); // switch back to view
  }

  function showError(msg) {
    els.formError.textContent = msg;
    setHidden(els.formError, false);
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  }

  function seedIfNeeded() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      try {
        reservations = JSON.parse(existing) || [];
        // If older seeded data had duplicate IDs (possible when Date.now() collided), fix it.
        const seen = new Set();
        let changed = false;
        reservations.forEach(r => {
          if (seen.has(r.id)) {
            r.id = newId();
            changed = true;
          }
          seen.add(r.id);
        });
        if (changed) persist();
        return;
      } catch (e) {
        // fall through and reseed
      }
    }

    const today = new Date();
    const todayISO = toISODate(today);
    const tomorrowISO = toISODate(addDays(today, 1));

    reservations = [
      {
        id: newId(),
        userId: loggedInUserID,
        lab: "GK302B",
        seat: 14,
        date: todayISO,
        startTime: "10:00",
        endTime: "11:30",
        anonymous: false,
        cancelled: false,
      },
      {
        id: newId(),
        userId: loggedInUserID,
        lab: "GK301",
        seat: 8,
        date: tomorrowISO,
        startTime: "13:00",
        endTime: "14:30",
        anonymous: true,
        cancelled: false,
      },
      {
        id: newId(),
        userId: loggedInUserID,
        lab: "GK302A",
        seat: 3,
        date: toISODate(addDays(today, -2)),
        startTime: "09:00",
        endTime: "10:00",
        anonymous: false,
        cancelled: false,
      },
    ];

    persist();
  }

  function getFilteredReservations() {
    const labFilter = els.filterLab.value;
    const statusFilter = els.filterStatus.value;
    const q = (els.filterSearch.value || "").trim().toLowerCase();

    return reservations
      .filter(r => r.userId === loggedInUserID)
      .map(r => ({ ...r, _status: statusFor(r) }))
      .filter(r => (labFilter === "ALL" ? true : r.lab === labFilter))
      .filter(r => (statusFilter === "ALL" ? true : r._status === statusFilter))
      .filter(r => {
        if (!q) return true;
        return (
          r.id.toLowerCase().includes(q) ||
          r.lab.toLowerCase().includes(q) ||
          String(r.seat).includes(q)
        );
      })
      .sort((a, b) => {
        // upcoming first by date/time
        if (a._status !== b._status) {
          const order = { TODAY: 0, UPCOMING: 1, PAST: 2, CANCELLED: 3 };
          return (order[a._status] ?? 99) - (order[b._status] ?? 99);
        }
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return minutesFromHHMM(a.startTime) - minutesFromHHMM(b.startTime);
      });
  }

  function renderStats() {
    const mine = reservations.filter(r => r.userId === loggedInUserID);
    const counts = { UPCOMING: 0, TODAY: 0, PAST: 0, CANCELLED: 0 };

    mine.forEach(r => {
      counts[statusFor(r)]++;
    });

    const upcoming = counts.UPCOMING;
    const today = counts.TODAY;
    const total = mine.length;
    const cancelled = counts.CANCELLED;

    els.statUpcoming.textContent = String(upcoming);
    els.statToday.textContent = String(today);
    els.statTotal.textContent = String(total);
    els.statCancelled.textContent = String(cancelled);

    els.statUpcomingBadge.textContent = String(upcoming);
    els.statTodayBadge.textContent = String(today);
    els.statTotalBadge.textContent = String(total);
    els.statCancelledBadge.textContent = String(cancelled);
  }

  function renderTableRows(list) {
    if (!list.length) {
      els.tbody.innerHTML = "";
      setHidden(els.emptyState, false);
      return;
    }

    setHidden(els.emptyState, true);

    els.tbody.innerHTML = list
      .map(r => {
        const stat = r._status;
        return `
          <tr>
            <td><b>${r.id}</b></td>
            <td>${r.lab}</td>
            <td>${formatDateLabel(r.date)}</td>
            <td>${r.startTime} - ${r.endTime}</td>
            <td>Seat ${r.seat}</td>
            <td>${visibilityLabel(r)}</td>
            <td>
              <span class="badge ${badgeClass(stat)}">
                <span class="material-symbols-outlined" style="font-size:18px;">${stat === "CANCELLED" ? "cancel" : "schedule"}</span>
                ${prettyStatus(stat)}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button class="action-btn" type="button" data-action="view" data-id="${r.id}">
                  <span class="material-symbols-outlined">visibility</span>
                  View
                </button>
                <button class="action-btn primary" type="button" data-action="edit" data-id="${r.id}">
                  <span class="material-symbols-outlined">edit</span>
                  Edit
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    // Hook action buttons
    els.tbody.querySelectorAll("button[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");
// keep details panel in sync
        openModal(id, action === "edit" ? "edit" : "view");
      });
    });
  }

  function render() {
    renderStats();
    const list = getFilteredReservations();
    renderTableRows(list);

    // If details panel is showing a reservation that no longer exists, reset.
    if (activeReservationId && !reservations.find(r => r.id === activeReservationId)) {
      activeReservationId = null;
    }
  }

  // ---------- Events ----------
  function bindEvents() {
    [els.filterLab, els.filterStatus, els.filterSearch].forEach(el => {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

    // modal close (use capture + stopPropagation for reliability)
    els.modalClose.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      },
      true
    );
    els.btnCancel.addEventListener("click", () => {
      // back to view, but keep modal open if there's an active reservation
      if (activeReservationId) openModal(activeReservationId, "view");
      else closeModal();
    });

    // close on overlay click
    els.overlay.addEventListener("click", (e) => {
      if (e.target === els.overlay) closeModal();
    });

    // close on Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !els.overlay.hidden) {
        closeModal();
      }
    });

    // tabs
    els.tabView.addEventListener("click", () => setTab("view"));
    els.tabEdit.addEventListener("click", () => setTab("edit"));

    // edit form
    els.editForm.addEventListener("submit", validateAndSaveEdit);

    // time dropdowns
    els.editStart.addEventListener("change", () => {
      syncEndTimes();
    });

    // when lab is (disabled) but could change later; still keep seat hint updated if ever enabled
    els.editLab.addEventListener("change", () => {
      const lab = els.editLab.value;
      els.seatHint.textContent = `Seat must be within ${lab} capacity (${LAB_CAPACITY[lab]}).`;
      els.editSeat.max = String(LAB_CAPACITY[lab] ?? 20);
    });
  }

  // ---------- Init ----------
  function init() {
    buildTimeOptions(els.editStart);
    buildTimeOptions(els.editEnd);

    seedIfNeeded();
    render();
    bindEvents();
  }

  init();
})();
