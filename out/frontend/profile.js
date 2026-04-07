import { ClientDBUtil } from "./util/ClientDbUtil.js";
"use strict";
// @ts-nocheck
// I hardcoded this for now to be the same as the logged in user
const BASE_URL = "https://labynx.onrender.com";
const loggedInUserID = sessionStorage.getItem("user");
if (!loggedInUserID) {
    window.location.href = "index.html";
}
const urlParams = new URLSearchParams(window.location.search);
const profileUserID = urlParams.get("id");
const profileID = profileUserID || loggedInUserID;
const profileDetails = document.querySelector(".profile-details");
const block = document.querySelector(".block1");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");
const profileImage = document.getElementById("profileImage");
const inputs = document.querySelectorAll(".profile-form input");
let formsActive = false;
const accountJSON = sessionStorage.getItem("account");
if (accountJSON) {
    const account = JSON.parse(accountJSON);
    const dashboardLink = document.querySelector('.sidebar a[href="dashboard.html"]');
    if (dashboardLink && account.accountType === "Admin") {
        dashboardLink.href = "dashboard-admin.html";
    }
}
const reservationsBtn = document.getElementById("reservationsBtn");
const upcomingBtn = document.getElementById("upcomingBtn");
const reservationList = document.getElementById("reservationList");
const listTitle = document.getElementById("listTitle");
const upcomingTableBody = document.getElementById("upcomingTableBody");
if (editBtn) {
    if (loggedInUserID === profileID) {
        editBtn.style.display = "block";
    }
    else {
        editBtn.style.display = "none";
    }
}
editBtn?.addEventListener("click", () => {
    inputs.forEach(input => input.removeAttribute("disabled"));
    if (block)
        block.style.gridTemplateColumns = "auto 45rem";
    profileDetails.style.display = "flex";
    if (saveBtn)
        saveBtn.style.display = "block";
    if (cancelBtn)
        cancelBtn.style.display = "block";
    if (changePhotoBtn)
        changePhotoBtn.style.display = "block";
    editBtn.style.display = "none";
    if (reservationList)
        reservationList.style.display = "none";
    formsActive = true;
});
cancelBtn?.addEventListener("click", () => {
    inputs.forEach(input => input.setAttribute("disabled", "true"));
    if (block)
        block.style.gridTemplateColumns = "auto";
    profileDetails.style.display = "none";
    if (saveBtn)
        saveBtn.style.display = "none";
    if (cancelBtn)
        cancelBtn.style.display = "none";
    if (changePhotoBtn)
        changePhotoBtn.style.display = "none";
    if (editBtn)
        editBtn.style.display = "block";
    formsActive = false;
});
saveBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    inputs.forEach(input => {
        const htmlInput = input;
        const value = htmlInput.value.trim();
        if (value !== "") {
            formData.append(htmlInput.name, value);
        }
    });
    const file = photoInput.files?.[0];
    if (file) {
        formData.append('profileImage', file);
    }
    try {
        const res = await fetch(`${BASE_URL}/users/${profileID}`, {
            method: 'PUT',
            body: formData
        });
        if (!res.ok)
            throw new Error('Failed to update profile');
        const updatedUser = await res.json();
        const firstNameEl = document.querySelector('#firstName');
        if (firstNameEl)
            firstNameEl.textContent = updatedUser.firstName;
        const lastNameEl = document.querySelector('#lastName');
        if (lastNameEl)
            lastNameEl.textContent = updatedUser.lastName;
        const studentIDEl = document.querySelector('#studentID');
        if (studentIDEl)
            studentIDEl.textContent = updatedUser.studentID;
        const courseEl = document.querySelector('#course');
        if (courseEl)
            courseEl.textContent = updatedUser.course;
        const contactNumberEl = document.querySelector('#contactNumber');
        if (contactNumberEl)
            contactNumberEl.textContent = updatedUser.contactNumber;
        const emailEl = document.querySelector('#email');
        if (emailEl)
            emailEl.textContent = updatedUser.email;
        if (profileImage)
            profileImage.src = `${BASE_URL}/images/${updatedUser.profileImage}`;
        if (cancelBtn)
            cancelBtn.click();
        loadProfile();
    }
    catch (err) {
        console.error(err);
    }
});
changePhotoBtn?.addEventListener("click", () => {
    photoInput?.click();
});
photoInput?.addEventListener("change", () => {
    const files = photoInput.files;
    const file = files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            if (typeof e.target?.result === 'string') {
                profileImage.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
});
async function showUpcomingReservations() {
    if (!upcomingTableBody || !reservationList)
        return;
    upcomingTableBody.innerHTML = "";
    reservationList.style.display = "flex";
    if (block)
        block.style.gridTemplateColumns = "auto 45rem";
    profileDetails.style.display = "none";
    if (listTitle)
        listTitle.textContent = "Reservations";
    try {
        await ClientDBUtil.validateSession();
        const reservationRes = await fetch(`/reservations/user/${profileID}`, {
            credentials: "include"
        });
        if (!reservationRes.ok) {
            const err = await reservationRes.json();
            console.error("Fetch error:", err);
            return;
        }
        const reservations = await reservationRes.json();
        updateReservations(reservations);
    }
    catch (error) {
        console.error("Error fetching reservations:", error);
        upcomingTableBody.innerHTML =
            `<tr><td colspan = "4">Error loading reservations.</td></tr>`;
    }
}
function toggleReservations() {
    if (formsActive) {
        if (cancelBtn)
            cancelBtn.click();
    }
    if (reservationList && reservationList.style.display === "flex") {
        reservationList.style.display = "none";
        if (block)
            block.style.gridTemplateColumns = "auto";
    }
    else {
        showUpcomingReservations();
    }
}
;
async function loadProfile() {
    try {
        const res = await fetch(`${BASE_URL}/users/${profileID}`);
        if (!res.ok) {
            throw new Error("Failed to load profile");
        }
        const user = await res.json();
        const firstNameEl = document.querySelector('#firstName');
        if (firstNameEl)
            firstNameEl.textContent = user.firstName;
        const lastNameEl = document.querySelector('#lastName');
        if (lastNameEl)
            lastNameEl.textContent = user.lastName;
        const emailEl = document.querySelector('#email');
        if (emailEl)
            emailEl.textContent = user.email;
        const studentIDEl = document.querySelector('#studentID');
        if (studentIDEl)
            studentIDEl.textContent = user.studentID;
        const courseEl = document.querySelector('#course');
        if (courseEl)
            courseEl.textContent = user.course;
        const contactNumberEl = document.querySelector('#contactNumber');
        if (contactNumberEl)
            contactNumberEl.textContent = user.contactNumber;
        const userType = document.querySelector("#user-type");
        if (userType)
            userType.innerHTML = user.role;
        profileImage.src = `${BASE_URL}/images/${user.profileImage}`;
        inputs.forEach(input => {
            const htmlInput = input;
            switch (htmlInput.name) {
                case "firstName":
                    htmlInput.value = user.firstName || "";
                    break;
                case "lastName":
                    htmlInput.value = user.lastName || "";
                    break;
                case "email":
                    htmlInput.value = user.email || "";
                    break;
                case "studentID":
                    htmlInput.value = user.studentID || "";
                    break;
                case "course":
                    htmlInput.value = user.course || "";
                    break;
                case "contactNumber":
                    htmlInput.value = user.contactNumber || "";
                    break;
            }
        });
    }
    catch (error) {
        console.error("Error loading profile: ", error);
    }
}
if (upcomingBtn)
    upcomingBtn.addEventListener("click", toggleReservations);
if (reservationsBtn)
    reservationsBtn.addEventListener("click", toggleReservations);
function updateReservations(reservations) {
    const upcomingTable = document.querySelector("#upcoming-reservations");
    const upcomingTableBody = document.querySelector("#upcomingTableBody");
    const reservationsCnt = document.querySelector('#reservations');
    const upcoming = document.querySelector('#upcoming');
    const filler = document.querySelector("#filler");
    if (!upcomingTable || !upcomingTableBody)
        return;
    upcomingTableBody.innerHTML = "";
    let count = 0;
    let activeReservations = 0;
    const today = new Date();
    const sortedByDateReservations = [...reservations].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    let showedReservations = sortedByDateReservations;
    showedReservations.forEach(r => {
        if (r.status !== 'cancelled' && r.status !== 'past' && r.isAnonymous != true) {
            const reservationDate = new Date(r.date);
            activeReservations += 1;
            if (reservationDate.toDateString() === today.toDateString())
                count += 1;
            const tr = document.createElement("tr");
            let status = capitalizeFirstLetter(r.status);
            console.log(status);
            tr.innerHTML = `
                <td>${r.lab.room}</td>
                <td>${formatDate(r.dateRequested)} | Time: ${formatTime(r.dateRequested)}</td>
                <td>${formatDate(r.date)} | Time: ${formatTime(r.startTime)}-${formatTime(r.endTime)}</td>
                <td>Seats ${Array.isArray(r.seatNumbers) ? r.seatNumbers.join(", ") : r.seatNumber}</td>
                <td class="${r.status === 'today' ? 'warning' : r.status === 'cancelled' ? 'danger' : 'success'}">${capitalizeFirstLetter(r.status)}</td>
            `;
            upcomingTableBody.appendChild(tr);
        }
    });
    if (activeReservations === 0) {
        if (filler)
            filler.innerHTML = "<h3>None</h3>";
    }
    if (reservationsCnt)
        reservationsCnt.textContent = String(activeReservations);
    if (upcoming)
        upcoming.textContent = String(count);
}
function capitalizeFirstLetter(string) {
    if (!string || string.length === 0) {
        return "";
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function formatDate(dateInput) {
    const date = new Date(dateInput);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
function formatTime(dateInput) {
    const date = new Date(dateInput);
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
}
document.addEventListener("DOMContentLoaded", async () => {
    await ClientDBUtil.validateSession();
    try {
        const reservationRes = await fetch(`${BASE_URL}/reservations/user/${profileID}`);
        const reservations = await reservationRes.json();
        updateReservations(reservations);
    }
    catch (e) {
        console.error("Error: ", e);
    }
});
loadProfile();
//# sourceMappingURL=profile.js.map
//# sourceMappingURL=profile.js.map