import { queryElement } from "./util/frontendUtil.js";
const dateInput = queryElement("#current-date");
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
dateInput.value = `${yyyy}-${mm}-${dd}`;
/*
const loggedInUserJSON = sessionStorage.getItem("loggedInUser");
let loggedInUser = null;

if (loggedInUserJSON) {
    loggedInUser = JSON.parse(loggedInUserJSON);
}

if (loggedInUser) {
    const infoEl = document.querySelector(".profile .info p b");
    const userTypeEl = document.getElementById("user-type");

    if (infoEl) infoEl.textContent = loggedInUser.firstName;
    if (userTypeEl) userTypeEl.textContent = loggedInUser.accountType;
}

if (loggedInUser && loggedInUser.accountType === "Admin") {
    const dashboardLink = document.querySelector('.sidebar a[href="dashboard.html"]');
    if (dashboardLink) {
        dashboardLink.href = "dashboard-admin.html";
    }
}*/
document.addEventListener("DOMContentLoaded", async () => {
    const userID = sessionStorage.getItem("user");
    if (!userID) {
        window.location.href = "index.html";
        return;
    }
    try {
        const userRes = await fetch(`http://localhost:3000/users/${userID}`);
        const user = await userRes.json();
        if (user.role === "Admin") {
            window.location.href = "./dashboard-admin.html";
            return;
        }
        queryElement('#user-name').textContent = `${user.firstName}`;
        queryElement('#user-type').textContent = `${user.role}`;
        const reservationRes = await fetch(`http://localhost:3000/reservations/user/${userID}`);
        const reservations = await reservationRes.json();
        updateDashboard(reservations);
    }
    catch (e) {
        console.error("Error: ", e);
    }
});
function updateDashboard(reservations) {
    const upcomingTable = queryElement("#upcoming-reservations");
    const upcomingTableBody = queryElement("tbody", upcomingTable);
    const noUpcoming = queryElement('#no-upcoming');
    const noReservations = queryElement('#no-reservations');
    const filler = queryElement("#filler");
    upcomingTableBody.innerHTML = "";
    if (reservations.length === 0) {
        filler.innerHTML = "<h3>None</h3>";
    }
    let count = 0;
    const today = new Date();
    reservations.forEach(r => {
        const reservationDate = new Date(r.date);
        const startTime = new Date(r.startTime);
        const endTime = new Date(r.endTime);
        if (reservationDate.toDateString() === today.toDateString())
            count += 1;
        const tableRow = document.createElement(`tr`);
        tableRow.innerHTML =
            `
                <td>${r.lab.name}</td>
                <td>${new Date(r.dateRequested).toLocaleString()}</td>
                <td>${r.Date.toLocaleString()} · ${startTime.getHours()}:${startTime.getMinutes()}-${endTime.getHours()}:${endTime.getMinutes()}</td>
                <td>Seat ${r.seatNumber}</td>
                <td class = "${r.status === 'today' ? 'warning' : 'success'}">${r.status}</td>
            `;
        upcomingTable.appendChild(tr);
    });
    noUpcoming.textContent = count;
    noReservations.textContent = reservations.length;
}
//# sourceMappingURL=dashboard.js.map