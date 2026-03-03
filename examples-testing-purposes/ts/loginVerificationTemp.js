import { accounts } from "./accounts.js";
import { LogInModal } from "./LogInModal.js";
let logInModal;
document.getElementById("sign-in")?.addEventListener("click", () => {
    initLoginModal("LOG_IN");
});
document.getElementById("register")?.addEventListener("click", () => {
    initLoginModal("SIGN_IN");
});
document.getElementById("sign-in2")?.addEventListener("click", () => {
    initLoginModal("LOG_IN");
});
document.getElementById("register2")?.addEventListener("click", () => {
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
//# sourceMappingURL=loginVerificationTemp.js.map