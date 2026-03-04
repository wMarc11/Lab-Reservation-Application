import { queryElement } from "./util/frontendUtil.js";
const dateInput = queryElement("#current-date") as HTMLInputElement;
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
dateInput.value = `${yyyy}-${mm}-${dd}`;
const userID = sessionStorage.getItem("user");
const profileImage = document.querySelector('#user-pic') as HTMLImageElement;
async function loadUserImg() {
    try {
        const res = await fetch(`http://localhost:3000/users/${userID}`);
        if (!res.ok) {
            throw new Error("Failed to load profile");
        }
        const user = await res.json();
        if (profileImage) {
            profileImage.src = `http://localhost:3000/images/${user.profileImage}`;
        }
    }
    catch (error) {
        console.error("Error loading profile: ", error);
    }
}
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
    if (!userID) {
        window.location.href = "index.html";
        return;
    }
    try {
        const userRes = await fetch(`http://localhost:3000/users/${userID}`);
        const user = await userRes.json();
        if (user.role === "Student") {
            window.location.href = "./dashboard.html";
            return;
        }
        const userNameEl = document.querySelector('#user-name');
        const userTypeEl = document.querySelector('#user-type');
        if (userNameEl)
            userNameEl.textContent = `${user.firstName}`;
        if (userTypeEl)
            userTypeEl.textContent = `${user.role}`;
        const reservationRes = await fetch(`http://localhost:3000/reservations`);
        const reservations = await reservationRes.json();
        const activityRes = await fetch(`http://localhost:3000/activities`);
        const activities = await activityRes.json();
        updateReservations(reservations);
        visibleCount = 3;
        updateRecentActivity(activities);
    }
    catch (e) {
        console.error("Error: ", e);
    }
});
function updateReservations(reservations: any[]) {
    const upcomingTable = document.querySelector("#upcoming-reservations");
    const upcomingTableBody = upcomingTable?.querySelector("tbody");
    const noUpcoming = document.querySelector('#no-upcoming');
    const noReservations = document.querySelector('#totalReservations');
    const noShowReservations = document.querySelector('#noShowReservations');
    const filler = document.querySelector("#filler");
    if (!upcomingTable || !upcomingTableBody)
        return;
    upcomingTableBody.innerHTML = "";
    if (reservations.length === 0) {
        if (filler)
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
        const tr = document.createElement("tr");
        tr.innerHTML =
            `
                <td>${r.lab.room}</td>
                <td>${r.user.firstName} ${r.user.lastName}</td>
                <td>${new Date(r.dateRequested).toLocaleString()}</td>
                <td>${r.Date.toLocaleString()} · ${startTime.getHours()}:${startTime.getMinutes()}-${endTime.getHours()}:${endTime.getMinutes()}</td>
                <td>Seat ${r.seatNumber}</td>
                <td class="${r.status === 'today' ? 'warning' : 'success'}">${r.status}</td>
            `;
        upcomingTable.appendChild(tr);
    });
    if (noUpcoming)
        noUpcoming.textContent = String(count);
    if (noReservations){
        noReservations.textContent = String(reservations.length)
    };
    if(noShowReservations){
        let noShow = 0;
        const today = new Date();
        reservations.forEach(r => {
            const rDate = new Date(r.date);
            if(r.status === 'past' && 
               rDate.getFullYear() === today.getFullYear() &&
               rDate.getMonth() === today.getMonth() &&
               rDate.getDate() === today.getDate()){
                noShow += 1;
            }
        });

        noShowReservations.textContent = String(noShow);
    }
}
let visibleCount = 3;
function updateRecentActivity(activities: any []) {
    const activityList = document.querySelector('#recent-activity-list');
    if (!activityList) {
        return;
    }
    activityList.innerHTML = '';
    console.log(activities);
    const sortedActivities = [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const showedActivities = sortedActivities.slice(0, visibleCount);
    showedActivities.forEach(a => {
        const li = document.createElement('li');
        const timePassed = formatTimePassed(new Date(a.timestamp));
        let text = "";
        if (a.action === "cancelled") {
            text = `Cancelled reservation for Seat ${a.seatNumber} in ${a.labName} by ${a.user.firstName} ${a.user.lastName}`;
        } else {
            text = `Reserved Seat ${a.seatNumber} in ${a.labName} by ${a.user.firstName} ${a.user.lastName}`;
        }
        li.innerHTML = `${text} <small>${timePassed}</small>`;
        activityList.appendChild(li);
    });
    if (visibleCount < sortedActivities.length) {
        const viewMore = document.createElement('li');
        viewMore.classList.add("view-more-activity");
        const a = document.createElement('a');
        a.textContent = "View More";
        a.addEventListener("click", (e) => {
            e.preventDefault();
            visibleCount += 2;
            updateRecentActivity(activities);
        });
        viewMore.appendChild(a);
        activityList.appendChild(viewMore);
    }
}
function formatTimePassed(date: Date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) {
        return "Just now";
    }
    else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }
    else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }
    else {
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
}
loadUserImg();
//# sourceMappingURL=dashboard.js.map