import { LAB_NAMES } from "../shared/labNames.js";
import { ClientDBUtil } from "./util/ClientDbUtil.js";
import { queryElement } from "./util/frontendUtil.js";
const userID = sessionStorage.getItem("user");
const profileImage = document.querySelector("#user-pic");
let isManager = false;
async function loadUserImg() {
    try {
        const res = await fetch(`/users/${userID}`);
        if (!res.ok) {
            throw new Error("Failed to load profile");
        }
        const user = await res.json();
        if (profileImage && user.profileImage) {
            profileImage.src = `/images/${user.profileImage}`;
        }
    }
    catch (error) {
        console.error("Error loading profile: ", error);
    }
}
(function () {
    ClientDBUtil.validateSession();
    const els = {
        tbody: queryElement("#reservations-tbody"),
        emptyState: queryElement("#empty-state"),
        statUpcoming: queryElement("#stat-upcoming"),
        statToday: queryElement("#stat-today"),
        statTotal: queryElement("#stat-total"),
        statUpcomingBadge: queryElement("#stat-upcoming-badge"),
        statTodayBadge: queryElement("#stat-today-badge"),
        statTotalBadge: queryElement("#stat-total-badge"),
        statCancelled: queryElement("#stat-cancelled"),
        statCancelledBadge: queryElement("#stat-cancelled-badge"),
        filterLab: queryElement("#filter-lab"),
        filterStatus: queryElement("#filter-status"),
        filterSearch: queryElement("#filter-search"),
        overlay: queryElement("#modal-overlay"),
        modalClose: queryElement("#modal-close"),
        tabView: queryElement("#tab-view"),
        tabEdit: queryElement("#tab-edit"),
        viewPane: queryElement("#view-pane"),
        modalViewGrid: queryElement("#modal-view-grid"),
        editForm: queryElement("#edit-form"),
        formError: queryElement("#form-error"),
        btnCancel: queryElement("#btn-cancel"),
        editId: queryElement("#edit-id"),
        editLab: queryElement("#edit-lab"),
        editDate: queryElement("#edit-date"),
        editStart: queryElement("#edit-start"),
        editSeatInput: queryElement("#edit-seat-input"),
        addSeatBtn: queryElement("#add-seat-btn"),
        editSeatList: queryElement("#edit-seat-list"),
        editAnon: queryElement("#edit-anon"),
        seatHint: queryElement("#seat-hint"),
    };
    let reservations = [];
    let activeReservationId = null;
    let draftSeatNumbers = [];
    function pad2(n) {
        return String(n).padStart(2, "0");
    }
    function toISODate(dateInput) {
        const date = new Date(dateInput);
        return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    }
    function formatDateLabel(isoDate) {
        const today = toISODate(new Date());
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrow = toISODate(tomorrowDate);
        if (isoDate === today)
            return "Today";
        if (isoDate === tomorrow)
            return "Tomorrow";
        return isoDate;
    }
    function formatLockedDate(dateInput) {
        const isoDate = toISODate(dateInput);
        const [year, month, day] = isoDate.split("-");
        return `${month}/${day}/${year}`;
    }
    function formatReservationTime(dateTimeValue) {
        const date = new Date(dateTimeValue);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }
    function formatReservationTimeRange(reservation) {
        const startValue = formatReservationTime(reservation.startTime);
        const endValue = formatReservationTime(reservation.endTime);
        return `${startValue} - ${endValue}`;
    }
    function statusFor(res) {
        const status = (res.status ?? "upcoming").toString().toLowerCase();
        if (status === "cancelled")
            return "CANCELLED";
        if (status === "today")
            return "TODAY";
        if (status === "past")
            return "PAST";
        return "UPCOMING";
    }
    function prettyStatus(status) {
        if (status === "UPCOMING")
            return "Upcoming";
        if (status === "TODAY")
            return "Today";
        if (status === "PAST")
            return "Past";
        return "Cancelled";
    }
    function badgeClass(status) {
        if (status === "UPCOMING")
            return "upcoming";
        if (status === "TODAY")
            return "today";
        if (status === "PAST")
            return "past";
        return "cancelled";
    }
    function visibilityLabel(reservation) {
        return reservation.isAnonymous ? "Anonymous" : "Public";
    }
    function setHidden(el, hidden) {
        if (!el)
            return;
        el.hidden = hidden;
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
    function getSeatNumbers(reservation) {
        return Array.isArray(reservation.seatNumbers) ? reservation.seatNumbers : [];
    }
    function renderSeatPills() {
        if (draftSeatNumbers.length === 0) {
            els.editSeatList.innerHTML = "";
            els.seatHint.textContent = "A reservation must keep at least one seat.";
            return;
        }
        els.editSeatList.innerHTML = draftSeatNumbers
            .map((seat) => `
          <span class="seat-pill">
            Seat ${seat}
            <button
              class="seat-pill-remove"
              type="button"
              data-seat="${seat}"
              ${draftSeatNumbers.length === 1 ? 'disabled title="At least one seat must remain"' : ""}
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </span>
        `)
            .join("");
        els.seatHint.textContent = `${draftSeatNumbers.length} seat${draftSeatNumbers.length === 1 ? "" : "s"} selected. Add or remove seats, but at least one seat must remain.`;
    }
    function setDraftSeatNumbers(seatNumbers) {
        draftSeatNumbers = [...new Set(seatNumbers)]
            .filter((seat) => Number.isInteger(seat) && seat > 0)
            .sort((a, b) => a - b);
        renderSeatPills();
    }
    function addSeatFromInput() {
        const rawValue = els.editSeatInput.value.trim();
        if (!rawValue) {
            return showError("Enter a seat number before adding.");
        }
        const seat = Number(rawValue);
        if (!Number.isInteger(seat) || seat <= 0) {
            return showError("Seat numbers must be positive whole numbers.");
        }
        if (draftSeatNumbers.includes(seat)) {
            return showError(`Seat ${seat} is already included in this reservation.`);
        }
        draftSeatNumbers = [...draftSeatNumbers, seat].sort((a, b) => a - b);
        els.editSeatInput.value = "";
        setHidden(els.formError, true);
        renderSeatPills();
    }
    function removeSeat(seatToRemove) {
        if (draftSeatNumbers.length <= 1) {
            return showError("A reservation must keep at least one seat.");
        }
        draftSeatNumbers = draftSeatNumbers.filter((seat) => seat !== seatToRemove);
        setHidden(els.formError, true);
        renderSeatPills();
    }
    function openModal(reservationID, mode) {
        activeReservationId = reservationID;
        const reservation = reservations.find((item) => item._id === reservationID);
        if (!reservation)
            return;
        const status = statusFor(reservation);
        const seatNumbers = getSeatNumbers(reservation);
        const timeRange = formatReservationTimeRange(reservation);
        const viewItems = [
            { label: "Reservation ID", value: reservation._id },
            { label: "Laboratory", value: reservation.lab.room },
            {
                label: "Date & Time Requested",
                value: reservation.dateRequested ? new Date(reservation.dateRequested).toLocaleString() : "N/A",
            },
            { label: "Date", value: formatDateLabel(toISODate(reservation.date)) },
            { label: "Time", value: timeRange },
            { label: "Seats", value: seatNumbers.length > 0 ? seatNumbers.join(", ") : "N/A" },
            { label: "Visibility", value: visibilityLabel(reservation) },
            { label: "Status", value: prettyStatus(status) },
        ];
        els.modalViewGrid.innerHTML = viewItems
            .map((item) => `<div class="detail-item"><span>${item.label}</span><b>${item.value}</b></div>`)
            .join("");
        els.editId.value = reservation._id;
        els.editLab.value = reservation.lab.room;
        els.editDate.value = formatLockedDate(reservation.date);
        generateTimeSlotsForEdit(reservation.date);
        const startLocal = new Date(reservation.startTime);
        els.editStart.value = `${pad2(startLocal.getHours())}:${pad2(startLocal.getMinutes())}`;
        els.editSeatInput.value = "";
        setDraftSeatNumbers(seatNumbers);
        els.editAnon.checked = Boolean(reservation.isAnonymous);
        setHidden(els.formError, true);
        setHidden(els.overlay, false);
        els.overlay.classList.add("is-open");
        document.body.classList.add("modal-open");
        setTab(mode);
    }
    function showError(message) {
        els.formError.textContent = message;
        setHidden(els.formError, false);
    }
    async function refreshReservations() {
        const user = await ClientDBUtil.getCurrentUser();
        const currentUserRole = user.role ?? "Student";
        isManager = currentUserRole === "Admin" || currentUserRole === "Lab Technician";
        if (isManager) {
            reservations = await ClientDBUtil.getAllReservations();
        }
        else {
            reservations = await ClientDBUtil.getCurrentReservations();
        }
        render();
    }
    async function validateAndSaveEdit(event) {
        event.preventDefault();
        setHidden(els.formError, true);
        const id = els.editId.value;
        const startInput = els.editStart.value;
        if (!startInput) {
            return showError("Start time is required.");
        }
        const existing = reservations.find((reservation) => reservation._id === id);
        if (!existing)
            return;
        const [hours, minutes] = startInput.split(":").map(Number);
        const localDate = new Date(existing.date);
        if (hours)
            localDate.setHours(hours);
        if (minutes)
            localDate.setMinutes(minutes);
        localDate.setSeconds(0);
        localDate.setMilliseconds(0);
        const startUTC = localDate.toISOString();
        const endDate = new Date(localDate);
        endDate.setMinutes(endDate.getMinutes() + 30);
        const endUTC = endDate.toISOString();
        if (draftSeatNumbers.length === 0) {
            return showError("A reservation must keep at least one seat.");
        }
        try {
            await ClientDBUtil.updateReservation(id, {
                startTime: startUTC,
                endTime: endUTC,
                seatNumbers: draftSeatNumbers,
                isAnonymous: els.editAnon.checked,
            });
            await refreshReservations();
            openModal(id, "view");
        }
        catch (error) {
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
            if (!query)
                return true;
            const seatText = getSeatNumbers(reservation).join(",");
            return (reservation._id.toLowerCase().includes(query) ||
                reservation.lab.room.toLowerCase().includes(query) ||
                seatText.includes(query));
        })
            .sort((left, right) => {
            if (left._status !== right._status) {
                const order = { TODAY: 0, UPCOMING: 1, PAST: 2, CANCELLED: 3 };
                return order[left._status] - order[right._status];
            }
            return new Date(left.date).getTime() - new Date(right.date).getTime();
        });
    }
    function renderStats() {
        const counts = { UPCOMING: 0, TODAY: 0, PAST: 0, CANCELLED: 0 };
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
    function renderTableRows(list) {
        if (list.length === 0) {
            els.tbody.innerHTML = "";
            setHidden(els.emptyState, false);
            return;
        }
        const userDisplay = document.querySelector("#displayUser");
        if (userDisplay) {
            userDisplay.style.display = isManager ? "table-cell" : "none";
        }
        setHidden(els.emptyState, true);
        els.tbody.innerHTML = list
            .map((reservation) => {
            const seats = getSeatNumbers(reservation);
            return `
          <tr>
            <td><b>${reservation._id}</b></td>
            ${isManager
                ? `<td>${typeof reservation.user === "string"
                    ? reservation.user
                    : `${reservation.user.firstName} ${reservation.user.lastName}`}</td>`
                : ""}
            <td>${reservation.lab.room}</td>
            <td>${reservation.dateRequested ? new Date(reservation.dateRequested).toLocaleString() : "N/A"}</td>
            <td>${formatDateLabel(toISODate(reservation.date))}</td>
            <td>${formatReservationTimeRange(reservation)}</td>
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
                if (!id)
                    return;
                if (action === "cancel") {
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
        els.addSeatBtn.addEventListener("click", addSeatFromInput);
        els.editSeatInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                addSeatFromInput();
            }
        });
        els.editSeatList.addEventListener("click", (event) => {
            const target = event.target;
            const removeButton = target?.closest(".seat-pill-remove");
            if (!removeButton)
                return;
            const seat = Number(removeButton.getAttribute("data-seat"));
            if (!Number.isFinite(seat))
                return;
            removeSeat(seat);
        });
    }
    async function hydrateProfileHeader() {
        const nameElement = document.getElementById("user-name");
        const roleElement = document.getElementById("user-type");
        try {
            const user = await ClientDBUtil.getCurrentUser();
            if (nameElement)
                nameElement.textContent = user.firstName;
            if (roleElement)
                roleElement.textContent = user.role ?? "Student";
        }
        catch {
            // no-op
        }
    }
    async function init() {
        populateLabSelections();
        bindEvents();
        await Promise.all([hydrateProfileHeader(), refreshReservations()]);
    }
    init().catch((error) => {
        console.error("Failed to initialize My Reservations page", error);
    });
    async function cancelReservations(ids) {
        try {
            const res = await fetch(`/reservations/cancel`, {
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
        }
        catch (error) {
            console.error("Cancel error:", error);
        }
    }
    function generateTimeSlotsForEdit(selectedDateInput) {
        const select = queryElement("#edit-start");
        if (!select)
            return;
        const startHour = 8;
        const endHour = 18;
        const selectedDate = selectedDateInput ? new Date(selectedDateInput) : new Date();
        const now = new Date();
        select.innerHTML = "";
        for (let h = startHour; h < endHour; h++) {
            for (let m of [0, 30]) {
                if (h === endHour && m > 0)
                    continue;
                const slotStart = new Date(selectedDate);
                slotStart.setHours(h, m, 0, 0);
                if (slotStart < now)
                    continue;
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotStart.getMinutes() + 30);
                const option = document.createElement("option");
                option.value = `${pad2(slotStart.getHours())}:${pad2(slotStart.getMinutes())}`;
                option.textContent = `${pad2(slotStart.getHours())}:${pad2(slotStart.getMinutes())} - ${pad2(slotEnd.getHours())}:${pad2(slotEnd.getMinutes())}`;
                select.appendChild(option);
            }
        }
    }
})();
loadUserImg();
//# sourceMappingURL=my-reservations.js.map