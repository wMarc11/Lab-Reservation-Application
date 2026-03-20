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

        const labsRes = await fetch(`http://localhost:3000/alllabs`);
        const labs = await labsRes.json();

        updateReservations(reservations);
        visibleCount = 3;
        updateRecentActivity(activities);

        const occupancy = computeLabOccupancy(labs, reservations);

        const labOccpancy = document.querySelector('#lab-occupancy');
        if(labOccpancy) labOccpancy.textContent = `${occupancy.occupancyRate}`;
    }
    catch (e) {
        console.error("Error: ", e);
    }
});

let visibleReservationCount = 5;
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

    let count = 0;
    let activeReservations = 0;

    const today = new Date();

    const sortedByDateReservations = [...reservations].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    let showedReservations = sortedByDateReservations;

    for (const r of showedReservations) {
        if(r.status !== 'cancelled' && r.status !== 'past'){
            const reservationDate = new Date(r.date);
            activeReservations += 1;
            if(reservationDate.toDateString() === today.toDateString()) 
                count += 1;
            
            const tr = document.createElement("tr");
            let status = capitalizeFirstLetter(r.status);
            console.log(status);
            if(activeReservations <= visibleReservationCount){
                tr.innerHTML = `
                    <td>${r.lab.room}</td>
                    <td>${r.user.firstName} ${r.user.lastName}</td>
                    <td>${formatDate(r.dateRequested)} | Time: ${formatTime(r.dateRequested)}</td>
                    <td>${formatDate(r.date)} | Time: ${formatTime(r.startTime)}-${formatTime(r.endTime)}</td>
                    <td>Seats ${Array.isArray(r.seatNumbers) ? r.seatNumbers.join(", ") : r.seatNumber}</td>
                    <td class="${r.status === 'today' ? 'warning' : r.status === 'cancelled' ? 'danger' : 'success'}">${capitalizeFirstLetter(r.status)}</td>
                `;
            }
            upcomingTableBody.appendChild(tr);
        }
    };

    if (activeReservations > visibleReservationCount) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="5" style="text-align:right; padding-right: 1rem;">
                <a href="all-reservations.html" class="view-more">View More</a>
            </td>
        `;
        upcomingTableBody.appendChild(tr);
    }

    if(activeReservations === 0){
        if(filler) filler.innerHTML = "<h3>None</h3>"
    }

    if (noUpcoming)
        noUpcoming.textContent = String(activeReservations);
    if (noReservations){
        noReservations.textContent = String(count);
    };
    if(noShowReservations){
        let noShow = 0;
        const today = new Date();
        reservations.forEach(r => {
            const rDate = new Date(r.date);
            if(r.status === 'past' && 
               rDate.getFullYear() === today.getFullYear() &&
               rDate.getMonth() === today.getMonth() &&
               rDate.getDate() === today.getDate() &&
               r.date === new Date()){
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

function capitalizeFirstLetter(string: string) {
  if (!string || string.length === 0) { 
    return "";
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatTime(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
}


function generateTimeSlots() {
    const select = document.querySelector("#timeslot") as HTMLSelectElement;

    const startHour = 7;
    const endHour = 18;
    const selectedDate = new Date(reserveDateInput.value);
    const now = new Date()

    for (let h = startHour; h < endHour; h++) {

        for (let m of [0, 30]) {
            if(h === endHour - 1 && m > 0)
                continue;

            const start = new Date(selectedDate);
            
            if(h === startHour)
                start.setHours(7, 30, 0, 0);
            else
                start.setHours(h, m, 0, 0);

            if(start < now)
                continue;

            const end = new Date(start);
            end.setMinutes(start.getMinutes() + 30);

            const option = document.createElement("option");
            option.value = start.toISOString();
            option.textContent =
                `${formatTime(start)} - ${formatTime(end)}`;

            select.appendChild(option);
        }
    }
}

const reserveDateInput = document.querySelector("#reserve-date") as HTMLInputElement;

const yyyy1 = today.getFullYear();
const mm1 = String(today.getMonth() + 1).padStart(2, '0');
const dd1 = String(today.getDate()).padStart(2, '0');

const maxDate = new Date(today);
maxDate.setDate(today.getDate() + 6);

const maxYYYY = maxDate.getFullYear();
const maxMM = String(maxDate.getMonth() + 1).padStart(2, '0');
const maxDD = String(maxDate.getDate()).padStart(2, '0');

reserveDateInput.value = `${yyyy1}-${mm1}-${dd1}`;
reserveDateInput.min = `${yyyy1}-${mm1}-${dd1}`;
reserveDateInput.max = `${maxYYYY}-${maxMM}-${maxDD}`;
reserveDateInput.disabled = false;

reserveDateInput.addEventListener("change", () => {
    generateTimeSlots();
});

async function loadBuildings() {

    const res = await fetch("http://localhost:3000/buildings");
    const buildings = await res.json();

    const select = document.querySelector("#building") as HTMLSelectElement;

    buildings.forEach((b: any) => {

        const option = document.createElement("option");
        option.value = b._id;
        option.textContent = b.name;

        select.appendChild(option);
    });
}

const buildingSelect = document.querySelector("#building") as HTMLSelectElement;
const floorSelect = document.querySelector("#floor") as HTMLSelectElement;
const labSelect = document.querySelector("#lab") as HTMLSelectElement;

let currentLabs: any[] = []; 

buildingSelect.addEventListener("change", async () => {
  const buildingId = buildingSelect.value;
  if (!buildingId) return;

  const res = await fetch(`http://localhost:3000/labs?building=${buildingId}`);
  currentLabs = await res.json();

  const floors = [...new Set(currentLabs.map(lab => lab.floor))].sort();
  floorSelect.innerHTML = '<option value="">Select Floor</option>';
  floors.forEach(f => {
    const option = document.createElement("option");
    option.value = f;
    option.textContent = f;
    floorSelect.appendChild(option);
  });
  floorSelect.disabled = false;

  labSelect.innerHTML = '<option value="">Select Lab</option>';
  labSelect.disabled = true;
});

floorSelect.addEventListener("change", () => {
  const selectedFloor = floorSelect.value;

  const filteredLabs = currentLabs.filter(lab => lab.floor.toString() === selectedFloor);

  labSelect.innerHTML = '<option value="">Select Lab</option>';
  filteredLabs.forEach(lab => {
    const option = document.createElement("option");
    option.value = lab._id;
    option.textContent = lab.room;
    labSelect.appendChild(option);
  });
  labSelect.disabled = false;
});

const reserveBtn = document.querySelector("#quick-reserve-btn");

reserveBtn?.addEventListener("click", async () => {

    const labId = (document.querySelector("#lab") as HTMLSelectElement).value;
    const time = (document.querySelector("#timeslot") as HTMLSelectElement).value;

    if (!labId || !time) {
        alert("Please select lab and time slot");
        return;
    }

    const startTime = new Date(time);
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + 30);

    const reservation = {
        lab: labId,
        date: startTime,
        isAnonymous: false,
        startTime: startTime,
        endTime: endTime
    };

    try {

        const res = await fetch("http://localhost:3000/reservations/quick", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reservation)
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Reservation failed");
            return;
        }

        alert(`Seat ${data.seatNumbers.join(", ")} reserved successfully`);

        window.location.reload();

    } catch (error) {
        console.error("Quick reserve error:", error);
        alert("Something went wrong");
    }
    window.location.reload();
});

function computeLabOccupancy(labs: any, reservations: any) {
    const now = new Date();

    let totalCapacity = 0;
    let occupiedSeats = 0;

    labs.forEach((lab: any) => {
        totalCapacity += lab.totalSeats;
    });

    reservations.forEach((r: any) => {
        if (r.status === 'cancelled') return;

        const start = new Date(r.startTime);
        const end = new Date(r.endTime);

        if (now >= start && now <= end) {
            if (Array.isArray(r.seatNumbers)) {
                occupiedSeats += r.seatNumbers.length;
            } else {
                occupiedSeats += 1;
            }
        }
    });

    const occupancyRate = totalCapacity === 0 
        ? 0 
        : Math.round((occupiedSeats / totalCapacity) * 100);

    return {
        occupiedSeats,
        totalCapacity,
        occupancyRate: `${occupancyRate}%`
    };
}
loadBuildings();

generateTimeSlots();

loadUserImg();
