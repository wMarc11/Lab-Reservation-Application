import { accounts } from "./accounts.js";
import { Account, ModalFields } from "./examples.js";
import { LogInModal } from "./LogInModal.js";

let logInModal: LogInModal;

document.getElementById("sign-in")?.addEventListener("click", () => {
    initLoginModal("LOG_IN");
})

document.getElementById("register")?.addEventListener("click", () => {
    initLoginModal("SIGN_IN");
})

document.getElementById("sign-in2")?.addEventListener("click", () => {
    initLoginModal("LOG_IN");
})

document.getElementById("register2")?.addEventListener("click", () => {
    initLoginModal("SIGN_IN");
})

function initLoginModal(type: "SIGN_IN" | "LOG_IN"): void {
    logInModal = new LogInModal(type);
    console.log("yurrr");
    logInModal.onLogIn(() => {
        const accountFound = logIn(logInModal.getLogInFields());
        if (accountFound === "Account Not Found")
            logInModal.displayErrorLogIn("Account not found lol");
    })
}

function logIn(logInFields: ModalFields): "Account Found" | "Account Not Found" {
    console.log(logInFields.email)
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

function sendToUserDashboard(account: Account) {
    sessionStorage.setItem("account", JSON.stringify(account));
    window.location.href = "./dashboard.html";
}

function sendToAdminDashboard(account: Account) {
    sessionStorage.setItem("account", JSON.stringify(account));
    window.location.href = "./dashboard-admin.html";
}
