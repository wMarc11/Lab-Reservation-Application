const dateInput = document.getElementById("current-date");

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

document.addEventListener("DOMContentLoaded", async() => {
    const userID = sessionStorage.getItem("user");

    if(!userID){
        window.location.href = "index.html";
        return;
    }

    try{
        const userRes = await fetch(`http://localhost:3000/users/${userID}`);
        const user = await userRes.json();

        if(user.role === "Admin"){
            window.location.href = "./dashboard-admin.html";
            return;
        }

        document.querySelector('#user-name').textContent = `${user.firstName}`;
        document.querySelector('#user-type').textContent = `${user.role}`;

        const reservationRes = await fetch(`http://localhost:3000/reservations/user/${userID}`);
        const reservations = await reservationRes.json();
        
        const activityRes = await fetch(`http://localhost:3000/activities/user/${userID}`);
        const activities = await activityRes.json();

        updateReservations(reservations);

        visibleCount = 3;
        updateRecentActivity(activities);
    } catch (e){
        console.error("Error: ", e);
    }
});

function updateReservations(reservations){
    const upcomingTable = document.querySelector("#upcoming-reservations");
    const upcomingTableBody = document.querySelector("#upcoming-reservations").querySelector("tbody");
    const noUpcoming = document.querySelector('#no-upcoming');
    const noReservations = document.querySelector('#no-reservations');
    const filler = document.querySelector("#filler");

    upcomingTableBody.innerHTML = "";

    if(reservations.length === 0){
        filler.innerHTML = "<h3>None</h3>"
    }

    let count = 0;

    const today = new Date();

    reservations.forEach(r => {
        const reservationDate = new Date(r.date);
        const startTime = new Date(r.startTime);
        const endTime = new Date(r.endTime);

        if(reservationDate.toDateString() === today.toDateString()) 
            count += 1;
        
        const tableRow = document.createElement(tr);
        tr.innerHTML =
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


let visibleCount = 3;
function updateRecentActivity(activities){
    const activityList = document.querySelector('#recent-activity-list');
    
    if(!activityList){
        return;
    }
        
    activityList.innerHTML = '';
    console.log(activities);
    const sortedActivities = [...activities].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

    const showedActivities = sortedActivities.slice(0, visibleCount);

    showedActivities.forEach(a => {
        const li = document.createElement('li');

        const timePassed = formatTimePassed(new Date(a.timestamp));

        let text = "";
        if(a.action === "cancelled"){
            text = `Cancelled reservation for Seat ${a.seatNumber} in ${a.labName}`;
        } else{
            text = `Reseved Seat ${a.seatNumber} in ${a.labName}`;
        }

        li.innerHTML = `${text} <small>${timePassed}</small>`;
        activityList.appendChild(li);
    });

    if(visibleCount < sortedActivities.length){
        const viewMore = document.createElement('li');
        viewMore.classList.add("view-more-activity");

        const a = document.createElement('a');
        a.textContent = "View More";

        a.addEventListener("click", (e) =>{
            e.preventDefault();
            visibleCount += 2;
            updateRecentActivity(activities);
        });

        viewMore.appendChild(a);
        activityList.appendChild(viewMore);
    }
}

function formatTimePassed(date) {
    const now = new Date();
    const diffMs = now - date;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "Just now";
    } else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
}