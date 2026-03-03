// @ts-nocheck

// I hardcoded this for now to be the same as the logged in user
// Basically, if this is changed, the edit button will not be displayed
const loggedInUserID = "12345679";

const profileUserID = document.querySelector("main").dataset.profileid;

const profileDetails = document.querySelector(".profile-details");
const block = document.querySelector(".block1");    
const formActions = document.querySelector(".form-actions");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");
const profileImage = document.getElementById("profileImage");

const inputs = document.querySelectorAll(".profile-form input");

let tableVisible = false;
let formsActive = false;

const accountJSON = sessionStorage.getItem("account");

if (accountJSON) {
    const account = JSON.parse(accountJSON);

    const dashboardLink = document.querySelector('.sidebar a[href="dashboard.html"]');
    if (dashboardLink && account.accountType === "Admin") {
        dashboardLink.href = "dashboard-admin.html";
    }
}

const upcomingReservations = [
    {
        studentID: "12345678",
        lab: "GK302B",
        datetimeRequested: "Yesterday 6:30 AM",
        datetime: "Today 10:00-11:30",
        seat: "Seat 14",
        status: "Upcoming",
        statusClass: "success"
    },  
    {
        studentID: "12345678",
        lab: "GK301",
        datetimeRequested: "Today 11:30 AM",
        datetime: "Tomorrow 1:00-2:30",
        seat: "Seat 8",
        status: "1 Day",
        statusClass: "danger"
    }
];

const reservationsBtn = document.getElementById("reservationsBtn");
const upcomingBtn = document.getElementById("upcomingBtn");

const reservationList = document.getElementById("reservationList");
const listTitle = document.getElementById("listTitle");
const upcomingTableBody = document.getElementById("upcomingTableBody");

if (loggedInUserID === profileUserID) {
    editBtn.style.display = "block";
};

editBtn.addEventListener("click", () => {
    inputs.forEach(input => input.removeAttribute("disabled"));
    block.style.gridTemplateColumns = "auto 45rem";
    profileDetails.style.display = "flex";
    saveBtn.style.display = "block";
    cancelBtn.style.display = "block";
    changePhotoBtn.style.display = "block";
    editBtn.style.display = "none";
    reservationList.style.display = "none";
    formsActive = true;
});

cancelBtn.addEventListener("click", () => {
    inputs.forEach(input => input.setAttribute("disabled", "true"));
    block.style.gridTemplateColumns = "auto";
    profileDetails.style.display = "none";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";
    changePhotoBtn.style.display = "none";
    editBtn.style.display = "block";
    formsActive = false;
});

saveBtn.addEventListener("click", (e) => {
    e.preventDefault();

    var isComplete = true;

    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value.trim() === "") {
            isComplete = false;
            break;
        }
    }

    if (!isComplete) {
        alert("Please fill in all fields before saving.");
        return;
    }

    inputs.forEach(input => {
        switch (input.placeholder) {
            case "First Name":
                document.getElementById("firstName").textContent = input.value;
                break;
            case "Last Name":
                document.getElementById("lastName").textContent = input.value;
                break;
            case "Enter your email":
                document.getElementById("email").textContent = input.value;
                break;
            case "Enter your student ID":
                document.getElementById("studentID").textContent = input.value;
                break;
            case "Enter your course":
                document.getElementById("course").textContent = input.value;
                break;
            case "Enter your contact number":
                document.getElementById("contactNumber").textContent = input.value;
                break;
        }
    });

    cancelBtn.click();
});

changePhotoBtn.addEventListener("click", () => {
    photoInput.click();
});

photoInput.addEventListener("change", (event) => {
    const file = photoInput.files[0]
    if (file) {
        const reader = new FileReader();        
        reader.onload = function(e) {
            profileImage.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

function showUpcomingReservations() {
    upcomingTableBody.innerHTML = "";
    reservationList.style.display = "flex";
    block.style.gridTemplateColumns = "auto 45rem";
    profileDetails.style.display = "none";
    listTitle.textContent = "Reservations";

    const reservations = upcomingReservations.filter(r => r.studentID === profileUserID);

    if (reservations.length === 0) {
        upcomingTableBody.innerHTML = `<tr><td colspan="4">No upcoming reservations</td></tr>`;
        return;
    }

    reservations.forEach(r => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${r.lab}</td>
                         <td>${r.datetimeRequested}</td>
                         <td>${r.datetime}</td>
                         <td>${r.seat}</td>
                         <td class="${r.statusClass}">${r.status}</td>`;
        upcomingTableBody.appendChild(row);
    });
}

function toggleReservations() {
    if (formsActive) {
        cancelBtn.click();
        tableVisible = false;
    }

    if (reservationList.style.display === "flex") {
        reservationList.style.display = "none";
        block.style.gridTemplateColumns = "auto";
        tableVisible = false;
    } else {
        showUpcomingReservations();
        tableVisible = true;
    }
}

upcomingBtn.addEventListener("click", toggleReservations);
reservationsBtn.addEventListener("click", toggleReservations);

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

import { accounts } from "../examples-testing-purposes/out-js/accounts.js";
import { formatOneWordTime, formatShortDateTime, getReservationCountInfo, getValidUser, setInnerHTML } from "../examples-testing-purposes/out-js/Helper.js";
function init() {
    const userId = getQueryParam("id");

    if (!userId) {
        console.error("No user ID provided.");
        return;
    }

    console.log(userId);
    const accountsArray = Object.values(accounts);

    const account = accountsArray.find(acc => acc.id.toString() === userId.toString());

    if (!account) {
        console.error("User not found.");
        return;
    }

    initProfile(account);
}

function initProfile(account) {
    var _a;
    console.log(account);   
    let userName = getValidUser(account.user);
    if (account.accountType === "Admin")
        userName = "Admin";
    setInnerHTML("#firstName", userName);
    setInnerHTML("#user-type", account.accountType);
    const reservationCounts = getReservationCountInfo(account.reservations);
    setInnerHTML("#reservations", reservationCounts.noOfReservations.toString());
    setInnerHTML("#upcoming", reservationCounts.noOfUpcoming.toString());
    setInnerHTML("#email", account.email);
    setInnerHTML("#course", account.course);
    setInnerHTML("#studentID", account.id.toString());
    setInnerHTML("#contactNumber", (_a = account.phoneNumber) !== null && _a !== void 0 ? _a : "No phone number");
}

document.addEventListener("DOMContentLoaded", () => {
    init();
});
