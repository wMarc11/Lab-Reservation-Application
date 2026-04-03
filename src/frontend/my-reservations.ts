import { LAB_NAMES, LabName } from "../shared/labNames.js";
import { ClientDBUtil } from "./util/ClientDbUtil.js";
import { queryElement } from "./util/frontendUtil.js";
import type { ReservationDTO } from "../shared/modelTypes.d.ts";

type Status = "UPCOMING" | "TODAY" | "PAST" | "CANCELLED";
type ReservationWithStatus = ReservationDTO & { _status: Status };


const userID = sessionStorage.getItem("user");

const profileImage = document.querySelector('#user-pic') as HTMLImageElement;

let isAdmin = false;

 const BASE_URL = "https://lab-reservation-application-wip.onrender.com";
//const BASE_URL = "http://localhost:3000";

async function loadUserImg(){
    try{
        const res = await fetch(`${BASE_URL}/users/${userID}`);

        if(!res.ok){
            throw new Error("Failed to load profile");
        }

        const user = await res.json();

        if(profileImage) {
            profileImage.src = `${BASE_URL}/images/${user.profileImage}`;
        }

    } catch(error){
        console.error("Error loading profile: ", error);
    }
}

(function () {
  ClientDBUtil.validateSession();

  const els = {
    tbody: queryElement<HTMLTableSectionElement>("#reservations-tbody"),
    emptyState: queryElement<HTMLElement>("#empty-state"),

    statUpcoming: queryElement<HTMLElement>("#stat-upcoming"),
    statToday: queryElement<HTMLElement>("#stat-today"),
    statTotal: queryElement<HTMLElement>("#stat-total"),
    statUpcomingBadge: queryElement<HTMLElement>("#stat-upcoming-badge"),
    statTodayBadge: queryElement<HTMLElement>("#stat-today-badge"),
    statTotalBadge: queryElement<HTMLElement>("#stat-total-badge"),
    statCancelled: queryElement<HTMLElement>("#stat-cancelled"),
    statCancelledBadge: queryElement<HTMLElement>("#stat-cancelled-badge"),

    filterLab: queryElement<HTMLSelectElement>("#filter-lab"),
    filterStatus: queryElement<HTMLSelectElement>("#filter-status"),
    filterSearch: queryElement<HTMLInputElement>("#filter-search"),

    overlay: queryElement<HTMLDivElement>("#modal-overlay"),
    modalClose: queryElement<HTMLButtonElement>("#modal-close"),
    tabView: queryElement<HTMLButtonElement>("#tab-view"),
    tabEdit: queryElement<HTMLButtonElement>("#tab-edit"),
    viewPane: queryElement<HTMLElement>("#view-pane"),
    modalViewGrid: queryElement<HTMLElement>("#modal-view-grid"),
    editForm: queryElement<HTMLFormElement>("#edit-form"),
    formError: queryElement<HTMLElement>("#form-error"),
    btnCancel: queryElement<HTMLButtonElement>("#btn-cancel"),

    editId: queryElement<HTMLInputElement>("#edit-id"),
    editLab: queryElement<HTMLSelectElement>("#edit-lab"),
    editDate: queryElement<HTMLInputElement>("#edit-date"),
    editSeat: queryElement<HTMLInputElement>("#edit-seat"),
    editStart: queryElement<HTMLSelectElement>("#edit-start"),
    editEnd: queryElement<HTMLSelectElement>("#edit-end"),
    editAnon: queryElement<HTMLInputElement>("#edit-anon"),
    seatHint: queryElement<HTMLElement>("#seat-hint"),
  };

  let reservations: ReservationDTO[] = [];
  let activeReservationId: string | null = null;

  function pad2(n: number) {
    return String(n).padStart(2, "0");
  }

  function toISODate(dateInput: string | Date) {
    const date = new Date(dateInput);
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function formatDateLabel(isoDate: string) {
    const today = toISODate(new Date());
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = toISODate(tomorrowDate);

    if (isoDate === today) return "Today";
    if (isoDate === tomorrow) return "Tomorrow";
    return isoDate;
  }

  function minutesFromTimeValue(value: string) {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getHours() * 60 + parsed.getMinutes();
    }

    if (/^\d{1,2}:\d{2}$/.test(value)) {
      const parts = value.split(":");
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      return hours * 60 + minutes;
    }

    throw new Error("Invalid time format");
  }

  function hhmmFromMinutes(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${pad2(h)}:${pad2(m)}`;
  }

  function toTimeInputValue(dateOrTime: string | Date) {
    const mins = minutesFromTimeValue(String(dateOrTime));
    return hhmmFromMinutes(mins);
  }

  function statusFor(res: ReservationDTO): Status {
    const status = (res.status ?? "upcoming").toString().toLowerCase();
    if (status === "cancelled") return "CANCELLED";
    if (status === "today") return "TODAY";
    if (status === "past") return "PAST";
    return "UPCOMING";
  }

  function prettyStatus(status: Status) {
    if (status === "UPCOMING") return "Upcoming";
    if (status === "TODAY") return "Today";
    if (status === "PAST") return "Past";
    return "Cancelled";
  }

  function badgeClass(status: Status) {
    if (status === "UPCOMING") return "upcoming";
    if (status === "TODAY") return "today";
    if (status === "PAST") return "past";
    return "cancelled";
  }

  function visibilityLabel(reservation: ReservationDTO) {
    return reservation.isAnonymous ? "Anonymous" : "Public";
  }

  function setHidden(el: HTMLElement, hidden: boolean) {
    if (!el) return;
    el.hidden = hidden;
  }

  function setTab(which: "edit" | "view") {
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

  function getSeatNumbers(reservation: ReservationDTO) {
    return Array.isArray(reservation.seatNumbers) ? reservation.seatNumbers : [];
  }

  function openModal(reservationID: string, mode: "edit" | "view") {
    activeReservationId = reservationID;
    const reservation = reservations.find((item) => item._id === reservationID);

    if (!reservation) return;

    const status = statusFor(reservation);
    const seatNumbers = getSeatNumbers(reservation);

    const viewItems = [
      { label: "Reservation ID", value: reservation._id },
      { label: "Laboratory", value: reservation.lab.room },
      {
        label: "Date & Time Requested",
        value: reservation.dateRequested ? new Date(reservation.dateRequested).toLocaleString() : "N/A",
      },
      { label: "Date", value: formatDateLabel(toISODate(reservation.date)) },
      {
        label: "Time",
        value: `${toTimeInputValue(reservation.startTime)} - ${toTimeInputValue(reservation.endTime)}`,
      },
      { label: "Seats", value: seatNumbers.length > 0 ? seatNumbers.join(", ") : "N/A" },
      { label: "Visibility", value: visibilityLabel(reservation) },
      { label: "Status", value: prettyStatus(status) },
    ];

    els.modalViewGrid.innerHTML = viewItems
      .map((item) => `<div class="detail-item"><span>${item.label}</span><b>${item.value}</b></div>`)
      .join("");

    els.editId.value = reservation._id;
    els.editLab.value = reservation.lab.room;
    els.editDate.value = toISODate(reservation.date);
    els.editSeat.value = String(seatNumbers[0] ?? "");
    els.editStart.value = toTimeInputValue(reservation.startTime);
    els.editEnd.value = toTimeInputValue(reservation.endTime);
    els.editAnon.checked = Boolean(reservation.isAnonymous);
    els.seatHint.textContent = `You can edit one seat number for this reservation.`;

    syncEndTimes();

    setHidden(els.overlay, false);
    els.overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    setTab(mode);
  }

  function buildTimeOptions(selectEl: HTMLSelectElement) {
    const startMin = 7 * 60;
    const endMin = 21 * 60;
    let html = "";

    for (let mins = startMin; mins <= endMin; mins += 30) {
      const value = hhmmFromMinutes(mins);
      html += `<option value="${value}">${value}</option>`;
    }

    selectEl.innerHTML = html;
  }

  function syncEndTimes() {
    const start = minutesFromTimeValue(els.editStart.value);
    const end = minutesFromTimeValue(els.editEnd.value);

    const options = Array.from(els.editEnd.options);
    options.forEach((option) => {
      const optionMinutes = minutesFromTimeValue(option.value);
      option.disabled = optionMinutes <= start;
    });

    if (end <= start) {
      const firstValid = options.find((option) => !option.disabled);
      if (firstValid) {
        els.editEnd.value = firstValid.value;
      }
    }
  }

  function showError(message: string) {
    els.formError.textContent = message;
    setHidden(els.formError, false);
  }

  async function refreshReservations() {
    const user = await ClientDBUtil.getCurrentUser();

    if (user.role === "Admin") {
      reservations = await ClientDBUtil.getAllReservations();
    } else {
      reservations = await ClientDBUtil.getCurrentReservations();
    }

    let currentUserRole = user.role;
    isAdmin = currentUserRole === "Admin";

    
    render();
  }

  async function validateAndSaveEdit(event: SubmitEvent) {
    event.preventDefault();
    setHidden(els.formError, true);

    const id = els.editId.value;
    const existing = reservations.find((reservation) => reservation._id === id);

    if (!existing) return;

    const date = els.editDate.value;
    const seat = Number(els.editSeat.value);
    const startTime = els.editStart.value;
    const endTime = els.editEnd.value;

    if (!date || !startTime || !endTime || !Number.isFinite(seat)) {
      return showError("Please complete all required fields.");
    }

    if (minutesFromTimeValue(endTime) <= minutesFromTimeValue(startTime)) {
      return showError("End time must be after start time.");
    }

    try {
      await ClientDBUtil.updateReservation(id, {
        date,
        startTime,
        endTime,
        seatNumbers: [seat],
        isAnonymous: els.editAnon.checked,
      });

      await refreshReservations();
      openModal(id, "view");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Unable to update reservation.");
    }
  }

  function getFilteredReservations() {
    const selectedLab = els.filterLab.value;
    const selectedStatus = els.filterStatus.value;
    const query = (els.filterSearch.value || "").trim().toLowerCase();


    return reservations
      .map((reservation) => ({ ...reservation, _status: statusFor(reservation) }))
      .filter((reservation) => (selectedLab === "ALL" ? true : reservation.lab.room === selectedLab))
      .filter((reservation) => (selectedStatus === "ALL" ? true : reservation._status === selectedStatus))
      .filter((reservation) => {
        if (!query) return true;

        const seatText = getSeatNumbers(reservation).join(",");
        return (
          reservation._id.toLowerCase().includes(query) ||
          reservation.lab.room.toLowerCase().includes(query) ||
          seatText.includes(query)
        );
      })
      .sort((left, right) => {
        if (left._status !== right._status) {
          const order: Record<Status, number> = { TODAY: 0, UPCOMING: 1, PAST: 2, CANCELLED: 3 };
          return order[left._status] - order[right._status];
        }

        return new Date(left.date).getTime() - new Date(right.date).getTime();
      });
  }

  function renderStats() {
    const counts: Record<Status, number> = { UPCOMING: 0, TODAY: 0, PAST: 0, CANCELLED: 0 };

    reservations.forEach((reservation) => {
      counts[statusFor(reservation)] += 1;
    });

    els.statUpcoming.textContent = String(counts.UPCOMING);
    els.statToday.textContent = String(counts.TODAY);
    els.statTotal.textContent = String(reservations.length);
    els.statCancelled.textContent = String(counts.CANCELLED);

    els.statUpcomingBadge.textContent = String(counts.UPCOMING);
    els.statTodayBadge.textContent = String(counts.TODAY);
    els.statTotalBadge.textContent = String(reservations.length);
    els.statCancelledBadge.textContent = String(counts.CANCELLED);
  }

  function renderTableRows(list: ReservationWithStatus[]) {
    if (list.length === 0) {
      els.tbody.innerHTML = "";
      setHidden(els.emptyState, false);
      return;
    }

    const userDisplay = document.querySelector('#displayUser') as HTMLElement;


    if(isAdmin){
      if(userDisplay) userDisplay.style.display = "block";
    }

    setHidden(els.emptyState, true);

    els.tbody.innerHTML = list
      .map((reservation) => {
        const seats = getSeatNumbers(reservation);

        return `
          <tr>
            <td><b>${reservation._id}</b></td>
           ${isAdmin && typeof reservation.user !== "string"
            ? `<td>${(reservation.user as { firstName: string; lastName: string }).firstName} ${(reservation.user as { firstName: string; lastName: string }).lastName}</td>`: ""}
            <td>${reservation.lab.room}</td>
            <td>${reservation.dateRequested ? new Date(reservation.dateRequested).toLocaleString() : "N/A"}</td>
            <td>${formatDateLabel(toISODate(reservation.date))}</td>
            <td>${toTimeInputValue(reservation.startTime)} - ${toTimeInputValue(reservation.endTime)}</td>
            <td>Seat${seats.length > 1 ? "s" : ""} ${seats.join(", ")}</td>
            <td>${visibilityLabel(reservation)}</td>
            <td>
              <span class="badge ${badgeClass(reservation._status)}">
                <span class="material-symbols-outlined" style="font-size:18px;">${reservation._status === "CANCELLED" ? "cancel" : "schedule"}</span>
                ${prettyStatus(reservation._status)}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button class="action-btn" type="button" data-action="view" data-id="${reservation._id}">
                  <span class="material-symbols-outlined">visibility</span>
                  View
                </button>
                <button class="action-btn primary" type="button" data-action="edit" data-id="${reservation._id}">
                  <span class="material-symbols-outlined">edit</span>
                  Edit
                </button>
                <button class="action-btn danger" type="button" data-action="cancel" data-id="${reservation._id}">
                  Cancel
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    els.tbody.querySelectorAll("button[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        const action = button.getAttribute("data-action");

        if (!id) return;

        if(action === "cancel"){
          if (confirm("Are you sure you want to cancel this reservation?")) {
            cancelReservations([id]);
          }
          return;
        }

        openModal(id, action === "edit" ? "edit" : "view");
      });
    });
  }

  function populateLabSelections() {
    const labOptions = LAB_NAMES.map((labName) => `<option value="${labName}">${labName}</option>`).join("");
    els.filterLab.innerHTML = `<option value="ALL">All Labs</option>${labOptions}`;
    els.editLab.innerHTML = labOptions;
  }

  function render() {
    renderStats();
    const filtered = getFilteredReservations();
    renderTableRows(filtered);

    if (activeReservationId && !reservations.find((reservation) => reservation._id === activeReservationId)) {
      activeReservationId = null;
      closeModal();
    }
  }

  function bindEvents() {
    [els.filterLab, els.filterStatus, els.filterSearch].forEach((input) => {
      input.addEventListener("input", render);
      input.addEventListener("change", render);
    });

    els.modalClose.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
    });

    els.btnCancel.addEventListener("click", () => {
      if (activeReservationId) {
        openModal(activeReservationId, "view");
        return;
      }

      closeModal();
    });

    els.overlay.addEventListener("click", (event) => {
      if (event.target === els.overlay) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !els.overlay.hidden) {
        closeModal();
      }
    });

    els.tabView.addEventListener("click", () => setTab("view"));
    els.tabEdit.addEventListener("click", () => setTab("edit"));

    els.editForm.addEventListener("submit", validateAndSaveEdit);
    els.editStart.addEventListener("change", syncEndTimes);

    els.editLab.addEventListener("change", () => {
      const lab = els.editLab.value as LabName;
      els.seatHint.textContent = `Editing reservation in ${lab}.`;
    });
  }

  async function hydrateProfileHeader() {
    const nameElement = document.getElementById("user-name");
    const roleElement = document.getElementById("user-type");

    try {
      const user = await ClientDBUtil.getCurrentUser();
      if (nameElement) nameElement.textContent = user.firstName;
      if (roleElement) roleElement.textContent = user.role ?? "Student";
    } catch {
      // no-op: this should not block reservations rendering
    }
  }

  async function init() {
    buildTimeOptions(els.editStart);
    buildTimeOptions(els.editEnd);
    populateLabSelections();
    bindEvents();

    await Promise.all([hydrateProfileHeader(), refreshReservations()]);
  }

  init().catch((error) => {
    console.error("Failed to initialize My Reservations page", error);
  });

  async function cancelReservations(ids: string[]) {
    try {
      const res = await fetch(`${BASE_URL}/reservations/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationIds: ids }),
      });

      if (!res.ok) {
        throw new Error("Failed to cancel reservations");
      }

      await refreshReservations();
    } catch (error) {
      console.error("Cancel error:", error);
    }
  }
})();

loadUserImg();