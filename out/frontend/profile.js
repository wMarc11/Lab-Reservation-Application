"use strict";
// @ts-nocheck
// I hardcoded this for now to be the same as the logged in user
const loggedInUserID = sessionStorage.getItem("user");
if (!loggedInUserID) {
    window.location.href = "index.html";
}
const params = new URLSearchParams(window.location.search);
const profileUserID = params.get("id");
const profileID = profileUserID || loggedInUserID;
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
const reservationsBtn = document.getElementById("reservationsBtn");
const upcomingBtn = document.getElementById("upcomingBtn");
const reservationList = document.getElementById("reservationList");
const listTitle = document.getElementById("listTitle");
const upcomingTableBody = document.getElementById("upcomingTableBody");
if (loggedInUserID === profileID) {
    editBtn.style.display = "block";
}
else {
    editBtn.style.display = "none";
}
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
saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    inputs.forEach(input => {
        formData.append(input.name, input.value);
    });
    if (photoInput.files[0]) {
        formData.append('profileImage', photoInput.files[0]);
    }
    try {
        const res = await fetch(`http://localhost:3000/users/${profileID}`, {
            method: 'PUT',
            body: formData
        });
        if (!res.ok)
            throw new Error('Failed to update profile');
        const updatedUser = await res.json();
        inputs.forEach(input => {
            const value = input.value.trim();
            if (value !== "") {
                switch (input.name) {
                    case "firstName":
                        document.querySelector('#firstName').textContent = value;
                        break;
                    case "lastName":
                        document.querySelector('#lastName').textContent = value;
                        break;
                    case "studentID":
                        document.querySelector('#studentID').textContent = value;
                        break;
                    case "course":
                        document.querySelector('#course').textContent = value;
                        break;
                    case "contactNumber":
                        document.querySelector('#contactNumber').textContent = value;
                        break;
                    case "email":
                        document.querySelector('#email').textContent = value;
                        break;
                }
            }
        });
        profileImage.src = `http://localhost:3000/images/${updatedUser.profileImage}`;
        cancelBtn.click();
    }
    catch (err) {
        alert(err.message);
        console.error(err);
    }
});
changePhotoBtn.addEventListener("click", () => {
    photoInput.click();
});
photoInput.addEventListener("change", (event) => {
    const file = photoInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            profileImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
async function showUpcomingReservations() {
    upcomingTableBody.innerHTML = "";
    reservationList.style.display = "flex";
    block.style.gridTemplateColumns = "auto 45rem";
    profileDetails.style.display = "none";
    listTitle.textContent = "Reservations";
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
        reservations.forEach(r => {
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
        cancelBtn.click();
        tableVisible = false;
    }
    if (reservationList.style.display === "flex") {
        reservationList.style.display = "none";
        block.style.gridTemplateColumns = "auto";
        tableVisible = false;
    }
    else {
        showUpcomingReservations();
        tableVisible = true;
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
        document.querySelector('#firstName').textContent = user.firstName;
        document.querySelector('#lastName').textContent = user.lastName;
        document.querySelector('#email').textContent = user.email;
        document.querySelector('#studentID').textContent = user.studentID;
        document.querySelector('#course').textContent = user.course;
        document.querySelector('#contactNumber').textContent = user.contactNumber;
        profileImage.src = `http://localhost:3000/images/${user.profileImage}`;
        inputs.forEach(input => {
            switch (input.name) {
                case "firstName":
                    input.value = user.firstName || "";
                    break;
                case "lastName":
                    input.value = user.lastName || "";
                    break;
                case "email":
                    input.value = user.email || "";
                    break;
                case "studentID":
                    input.value = user.studentID || "";
                    break;
                case "course":
                    input.value = user.course || "";
                    break;
                case "contactNumber":
                    input.value = user.contactNumber || "";
                    break;
            }
        });
    }
    catch (error) {
        console.error("Error loading profile: ", error);
    }
}
upcomingBtn.addEventListener("click", toggleReservations);
reservationsBtn.addEventListener("click", toggleReservations);
loadProfile();
//# sourceMappingURL=profile.js.map