const dateInput = document.getElementById("current-date");

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');

dateInput.value = `${yyyy}-${mm}-${dd}`;

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
}
