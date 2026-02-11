var _a, _b, _c, _d;
import { accounts } from "./accounts.js";
import { LogInModal } from "./LogInModal.js";
let logInModal;
(_a = document.getElementById("sign-in")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    initLoginModal("LOG_IN");
});
(_b = document.getElementById("register")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    initLoginModal("SIGN_IN");
});
(_c = document.getElementById("sign-in2")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
    initLoginModal("LOG_IN");
});
(_d = document.getElementById("register2")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
    initLoginModal("SIGN_IN");
});
function initLoginModal(type) {
    logInModal = new LogInModal(type);
    console.log("yurrr");
    logInModal.onLogIn(() => {
        const accountFound = logIn(logInModal.getLogInFields());
        if (accountFound === "Account Not Found")
            logInModal.displayErrorLogIn("Account not found lol");
    });
}
function logIn(logInFields) {
    console.log(logInFields.email);
    const account = accounts[logInFields.email];
    if (!account)
        return "Account Not Found";
    if (account.accountType === "Admin") {
        sendToAdminDashboard(account);
    }
    else if (account.accountType === "Student") {
        sendToUserDashboard(account);
    }
    return "Account Found";
}
function sendToUserDashboard(account) {
    sessionStorage.setItem("account", JSON.stringify(account));
    window.location.href = "./dashboard.html";
}
function sendToAdminDashboard(account) {
    sessionStorage.setItem("account", JSON.stringify(account));
    window.location.href = "./dashboard-admin.html";
}
