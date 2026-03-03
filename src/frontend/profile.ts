"use strict";
// @ts-nocheck
// I hardcoded this for now to be the same as the logged in user
const loggedInUserID = sessionStorage.getItem("user");
if (!loggedInUserID) {
    window.location.href = "index.html";
}
const urlParams = new URLSearchParams(window.location.search);
const profileUserID = urlParams.get("id");
const profileID = profileUserID || loggedInUserID;
const profileDetails = document.querySelector(".profile-details") as HTMLElement;
const block = document.querySelector(".block1") as HTMLElement;
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const photoInput = document.getElementById("photoInput");
const profileImage = document.getElementById("profileImage") as HTMLImageElement;
const inputs = document.querySelectorAll(".profile-form input");
let formsActive = false;
const accountJSON = sessionStorage.getItem("account");
if (accountJSON) {
    const account = JSON.parse(accountJSON);
    const dashboardLink = document.querySelector('.sidebar a[href="dashboard.html"]') as HTMLAnchorElement;
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
    if (block) block.style.gridTemplateColumns = "auto 45rem";
    profileDetails.style.display = "flex";
    if (saveBtn) saveBtn.style.display = "block";
    if (cancelBtn) cancelBtn.style.display = "block";
    if (changePhotoBtn) changePhotoBtn.style.display = "block";
    editBtn.style.display = "none";
    if (reservationList) reservationList.style.display = "none";
    formsActive = true;
});
cancelBtn?.addEventListener("click", () => {
    inputs.forEach(input => input.setAttribute("disabled", "true"));
    if (block) block.style.gridTemplateColumns = "auto";
    profileDetails.style.display = "none";
    if (saveBtn) saveBtn.style.display = "none";
    if (cancelBtn) cancelBtn.style.display = "none";
    if (changePhotoBtn) changePhotoBtn.style.display = "none";
    if (editBtn) editBtn.style.display = "block";
    formsActive = false;
});
saveBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    inputs.forEach(input => {
        const htmlInput = input as HTMLInputElement;
        const value = htmlInput.value.trim();
        if (value !== "") {
            formData.append(htmlInput.name, value);
        }
    });
    const file = (photoInput as HTMLInputElement).files?.[0];
    if (file) {
        formData.append('profileImage', file);
    }
    try {
        const res = await fetch(`http://localhost:3000/users/${profileID}`, {
            method: 'PUT',
            body: formData
        });
        if (!res.ok)
            throw new Error('Failed to update profile');
        const updatedUser = await res.json();
        const firstNameEl = document.querySelector('#firstName');
        if (firstNameEl) firstNameEl.textContent = updatedUser.firstName;
        const lastNameEl = document.querySelector('#lastName');
        if (lastNameEl) lastNameEl.textContent = updatedUser.lastName;
        const studentIDEl = document.querySelector('#studentID');
        if (studentIDEl) studentIDEl.textContent = updatedUser.studentID;
        const courseEl = document.querySelector('#course');
        if (courseEl) courseEl.textContent = updatedUser.course;
        const contactNumberEl = document.querySelector('#contactNumber');
        if (contactNumberEl) contactNumberEl.textContent = updatedUser.contactNumber;
        const emailEl = document.querySelector('#email');
        if (emailEl) emailEl.textContent = updatedUser.email;
        if (profileImage) profileImage.src = `http://localhost:3000/images/${updatedUser.profileImage}`;
        if (cancelBtn) cancelBtn.click();

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
    const files = (photoInput as HTMLInputElement).files;
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
    if (!upcomingTableBody || !reservationList) return;
    upcomingTableBody.innerHTML = "";
    reservationList.style.display = "flex";
    if (block) block.style.gridTemplateColumns = "auto 45rem";
    profileDetails.style.display = "none";
    if (listTitle) listTitle.textContent = "Reservations";
    try {
        const res = await fetch(`http://localhost:3000/reservations/user/${profileID}`);
        if (!res.ok) {
            throw new Error("Failed to fetch reservations");
        }
        const reservations = await res.json();
        if (reservations.length === 0) {
            upcomingTableBody.innerHTML =
                `<tr><td colspan="4">No reservations found.</td></tr>`;
            return;
        }
        reservations.forEach((r: { lab: string; date: string; time: string; status: string }) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${r.lab || "N/A"}</td>
                <td>${r.date || "N/A"}</td>
                <td>${r.time || "N/A"}</td>
                <td>${r.status || "Pending"}</td>
            `;
            upcomingTableBody.appendChild(row);
        });
    }
    catch (error) {
        console.error("Error fetching reservations:", error);
        upcomingTableBody.innerHTML =
            `<tr><td colspan = "4">Error loading reservations.</td></tr>`;
    }
}
function toggleReservations() {
    if (formsActive) {
        if (cancelBtn) cancelBtn.click();
    }
    if (reservationList && reservationList.style.display === "flex") {
        reservationList.style.display = "none";
        if (block) block.style.gridTemplateColumns = "auto";
    }
    else {
        showUpcomingReservations();
    }
}
;
async function loadProfile() {
    try {
        const res = await fetch(`http://localhost:3000/users/${profileID}`);
        if (!res.ok) {
            throw new Error("Failed to load profile");
        }
        const user = await res.json();
        const firstNameEl = document.querySelector('#firstName');
        if (firstNameEl) firstNameEl.textContent = user.firstName;
        const lastNameEl = document.querySelector('#lastName');
        if (lastNameEl) lastNameEl.textContent = user.lastName;
        const emailEl = document.querySelector('#email');
        if (emailEl) emailEl.textContent = user.email;
        const studentIDEl = document.querySelector('#studentID');
        if (studentIDEl) studentIDEl.textContent = user.studentID;
        const courseEl = document.querySelector('#course');
        if (courseEl) courseEl.textContent = user.course;
        const contactNumberEl = document.querySelector('#contactNumber');
        if (contactNumberEl) contactNumberEl.textContent = user.contactNumber;
        profileImage.src = `http://localhost:3000/images/${user.profileImage}`;
        inputs.forEach(input => {
            const htmlInput = input as HTMLInputElement;
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
if (upcomingBtn) upcomingBtn.addEventListener("click", toggleReservations);
if (reservationsBtn) reservationsBtn.addEventListener("click", toggleReservations);
loadProfile();
//# sourceMappingURL=profile.js.map