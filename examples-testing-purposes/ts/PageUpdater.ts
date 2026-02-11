import { Account, DateTime, Reservation } from "./examples.js";


function init() {
    const accountJSON = sessionStorage.getItem("account");
    console.log("stared");
    if (!accountJSON) return;

    console.log("accountjson found");
    const account = JSON.parse(accountJSON);

    const currentFilePath = window.location.pathname;

    if(currentFilePath.endsWith("dashboard") /*|| currentFilePath.endsWith("dashboard-admin-testing.html")*/) {
        console.log("init dashboard");
        initDashboard(account.accountType, account.reservations);
    } else if (currentFilePath.endsWith("my-reservations")) {
        initMyReservation(account.accountType, account.reservations);
    } else if (currentFilePath.endsWith("profile")) {
        initProfile(account);
    }
}

function initDashboard(accountType: "Student" | "Admin", reservations: Reservation[]) {
    initProfileHeader(accountType);
    const {noOfReservations, noOfUpcoming} = getReservationCountInfo(reservations);
    const noReservations = document.querySelector("#no-reservations");
    if (noReservations) noReservations.innerHTML = noOfReservations.toString();
    const noUpcoming = document.querySelector("#no-upcoming");
    if (noUpcoming) noUpcoming.innerHTML = noOfUpcoming.toString();

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
        seat.innerHTML =  reservation.seat.toString();
        status.innerHTML = reservation.status;
        reservation.status === "Today" ? 
            status.classList.add("warning") : status.classList.add("success");

        row.appendChild(labratory);
        row.appendChild(dateTimeRequested);
        row.appendChild(dateTimeSchedule);
        row.appendChild(seat);
        row.appendChild(status);
        tbody?.appendChild(row)
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
    `

    row.innerHTML = INNER_HTML;
    return row;
}

function initMyReservation(accountType: "Student" | "Admin", reservations: Reservation[]) {
    initProfileHeader(accountType)
    const reservationCounts = getReservationCountInfo(reservations);
    const noUpcoming = document.querySelector("#stat-upcoming-badge");
    if (noUpcoming) noUpcoming.innerHTML = reservationCounts.noOfUpcoming.toString();
    const noToday = document.querySelector("#stat-today-badge");
    if (noToday) noToday.innerHTML = reservationCounts.noOfToday.toString();
    const noReservations = document.querySelector("#stat-total-badge");
    if (noReservations) noReservations.innerHTML = reservationCounts.noOfReservations.toString();


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
    
        if (reservation.status === "Today") status.classList.add("warning");
            else status.classList.add("success");

        row.append(
            id,
            lab,
            dateTimeRequested,
            dateTimeSchedule,
            time,
            seat,
            visibility,
            status,
            createReservationButtonsRow(reservation.id),
        );

        reservationTBody.appendChild(row);
    }
}

function createReservationButtonsRow(accountID: string) {
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
    `
    buttonDataCell.innerHTML = INNER_HTML;
    return buttonDataCell;
}

function initProfile(account: Account) {
    const userType = document.querySelector("#user-type");
    if (userType) userType.innerHTML = account.accountType;

    const reservationCounts = getReservationCountInfo(account.reservations);
    const reservationCount = document.querySelector("#reservations");
    if (reservationCount) reservationCount.innerHTML = reservationCounts.noOfReservations.toString();
    const upcomingCount = document.querySelector("#upcoming");
    if (upcomingCount) upcomingCount.innerHTML = reservationCounts.noOfReservations.toString();

    const email = document.querySelector("#email");
    if (email) email.innerHTML = account.email;

    const id = document.querySelector("#studentID");
    if (id) id.innerHTML = account.id.toString();
}

function initProfileHeader(accountType: "Student" | "Admin") {
    const userType = document.querySelector("#user-type");
    if(userType) userType.innerHTML = accountType;
}

export function formatDateTime(dateTime: DateTime): string {
    const { year, month, day, time } = dateTime;
    const { hour, minute } = time;

    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    const minuteStr = minute.toString().padStart(2, "0");

    return `${month}/${day}/${year}, ${hour12}:${minuteStr}:00 ${ampm}`;
}


export function formatShortDateTime(dt: DateTime): string {
    const dayDiff = computeDayDifferenceFromToday(dt);

    let dayStr: string;
    if (dayDiff === 0) dayStr = "Today";
    else if (dayDiff === 1) dayStr = "Tomorrow";
    else if (dayDiff === -1) dayStr = "Yesterday";
    else dayStr = `${dt.month}/${dt.day}/${dt.year}`;

    const hour = dt.time.hour;
    const minute = dt.time.minute;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const minuteStr = minute.toString().padStart(2, "0");

    return `${dayStr} · ${hour12}:${minuteStr} ${ampm}`;
}

export function formatOneWordTime(dt: DateTime): string {
    const dayDiff = computeDayDifferenceFromToday(dt);

    let oneWord: string;
    if (dayDiff === 0) oneWord = "Today";
    else if (dayDiff === 1) oneWord = "Tomorrow";
    else if (dayDiff === -1) oneWord = "Yesterday";
    else oneWord = `${dt.month}/${dt.day}/${dt.year}`;

    return oneWord;
}

export function computeDayDifferenceFromToday(dt: DateTime): number {
    const now = new Date();
    const dtDate = new Date(dt.year, dt.month - 1, dt.day, dt.time.hour, dt.time.minute);

    const oneDayMs = 24 * 60 * 60 * 1000;
    const dayDiff = Math.floor(
        (dtDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / oneDayMs
    );

    return dayDiff;
}

export function getReservationCountInfo(reservations: Reservation[]) {
    return {
        noOfReservations: reservations.length,
        noOfToday: reservations.filter((reservation) => reservation.status === "Today").length,
        noOfUpcoming: reservations.filter((reservation) => reservation.status === "Upcoming").length,
    }
}

init();
