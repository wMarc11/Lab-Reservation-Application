import { formatOneWordTime, formatShortDateTime, getReservationCountInfo, getValidUser, setInnerHTML } from "./Helper.js";
function init() {
    const accountJSON = sessionStorage.getItem("account");
    console.log("stared");
    if (!accountJSON)
        return;
    console.log("accountjson found");
    const account = JSON.parse(accountJSON);
    const currentFilePath = window.location.pathname;
    if (currentFilePath.endsWith("dashboard") /*|| currentFilePath.endsWith("dashboard-admin-testing.html")*/) {
        console.log("init dashboard");
        initDashboard(getValidUser(account.user), account.accountType, account.reservations);
    }
    else if (currentFilePath.endsWith("my-reservations")) {
        initMyReservation(getValidUser(account.user), account.accountType, account.reservations);
    }
    else if (currentFilePath.endsWith("profile")) {
        initProfile(account);
    }
}
function initDashboard(userName, accountType, reservations) {
    initProfileHeader(userName, accountType);
    const { noOfReservations, noOfUpcoming } = getReservationCountInfo(reservations);
    setInnerHTML("#no-reservations", noOfReservations.toString());
    setInnerHTML("#no-upcoming", noOfUpcoming.toString());
    const upcomingReservationTable = document.getElementById("upcoming-reservations");
    if (!upcomingReservationTable)
        return;
    const tbody = upcomingReservationTable.querySelector("tbody");
    tbody?.replaceChildren();
    for (const reservation of reservations) {
        const row = document.createElement("tr");
        const labratory = document.createElement("td");
        const dateTimeRequested = document.createElement("td");
        const dateTimeSchedule = document.createElement("td");
        const seat = document.createElement("td");
        const status = document.createElement("td");
        labratory.innerHTML = reservation.labratory;
        dateTimeRequested.innerHTML = formatShortDateTime(reservation.dateTimeRequested);
        dateTimeSchedule.innerHTML = formatShortDateTime(reservation.dateTimeSchedule);
        seat.innerHTML = reservation.seat.toString();
        status.innerHTML = reservation.status;
        reservation.status === "Today" ?
            status.classList.add("warning") : status.classList.add("success");
        row.appendChild(labratory);
        row.appendChild(dateTimeRequested);
        row.appendChild(dateTimeSchedule);
        row.appendChild(seat);
        row.appendChild(status);
        tbody?.appendChild(row);
    }
    tbody?.appendChild(createViewAllRow());
}
function createViewAllRow() {
    const row = document.createElement("tr");
    const INNER_HTML = `
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="view-more"><a href="my-reservations.html">View All</a></td>
        </tr>
    `;
    row.innerHTML = INNER_HTML;
    return row;
}
function initMyReservation(userName, accountType, reservations) {
    initProfileHeader(userName, accountType);
    const reservationCounts = getReservationCountInfo(reservations);
    setInnerHTML("#stat-upcoming-badge", reservationCounts.noOfUpcoming.toString());
    setInnerHTML("#stat-today-badge", reservationCounts.noOfToday.toString());
    setInnerHTML("#stat-total-badge", reservationCounts.noOfReservations.toString());
    const reservationTBody = document.querySelector("#reservations-tbody");
    if (!reservationTBody)
        return;
    reservationTBody.replaceChildren();
    for (const reservation of reservations) {
        const row = document.createElement("tr");
        const id = document.createElement("td");
        const lab = document.createElement("td");
        const dateTimeRequested = document.createElement("td");
        const dateTimeSchedule = document.createElement("td");
        const time = document.createElement("td");
        const seat = document.createElement("td");
        const visibility = document.createElement("td");
        const status = document.createElement("td");
        id.innerHTML = reservation.id;
        lab.innerHTML = reservation.labratory;
        dateTimeSchedule.innerHTML = formatShortDateTime(reservation.dateTimeSchedule);
        dateTimeRequested.innerHTML = formatOneWordTime(reservation.dateTimeSchedule);
        time.innerHTML = `${reservation.time.hour}:${reservation.time.minute.toString().padStart(2, "0")}`;
        seat.innerHTML = reservation.seat.toString();
        visibility.innerHTML = reservation.visibility;
        status.innerHTML = reservation.status;
        if (reservation.status === "Today")
            status.classList.add("warning");
        else
            status.classList.add("success");
        row.append(id, lab, dateTimeRequested, dateTimeSchedule, time, seat, visibility, status, createReservationButtonsRow(reservation.id));
        reservationTBody.appendChild(row);
    }
}
function createReservationButtonsRow(accountID) {
    accountID = "R-MLHSJBZ4IY8I";
    const buttonDataCell = document.createElement("td");
    const INNER_HTML = `
            <td>
              <div class="row-actions">
                <button class="action-btn" type="button" data-action="view" data-id="${accountID}">
                  <span class="material-symbols-outlined">visibility</span>
                  View
                </button>
                <button class="action-btn primary" type="button" data-action="edit" data-id="${accountID}">
                  <span class="material-symbols-outlined">edit</span>
                  Edit
                </button>
              </div>
            </td> 
    `;
    buttonDataCell.innerHTML = INNER_HTML;
    return buttonDataCell;
}
function initProfile(account) {
    let userName = getValidUser(account.user);
    if (account.accountType === "Admin")
        userName = "Admin";
    setInnerHTML("#firstName", userName);
    setInnerHTML("#user-type", account.accountType);
    const reservationCounts = getReservationCountInfo(account.reservations);
    setInnerHTML("#reservations", reservationCounts.noOfReservations.toString());
    setInnerHTML("#upcoming", reservationCounts.noOfUpcoming.toString());
    setInnerHTML("#email", account.email);
    setInnerHTML("#studentID", account.id.toString());
    setInnerHTML("#course", account.course ?? "N/A");
    setInnerHTML("#contactNumber", account.phoneNumber ?? "No phone number");
}
function initProfileHeader(userName, accountType) {
    setInnerHTML("#user-name", userName);
    setInnerHTML("#user-type", accountType);
}
init();
//# sourceMappingURL=PageUpdater.js.map