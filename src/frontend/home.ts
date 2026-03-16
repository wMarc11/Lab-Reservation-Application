import { queryElement } from "./util/frontendUtil.js";
import { LogInModal } from "./LogInModal.js";
import { ClientDBUtil } from "./util/ClientDbUtil.js";

document.addEventListener("DOMContentLoaded", async () => {
    if (await ClientDBUtil.validateSession(false)) {
        window.location.href = "dashboard.html";
    }

    queryElement("#sign-in").addEventListener("click", () => {
        new LogInModal("LOG_IN");
    })

    queryElement("#register").addEventListener("click", () => {
        new LogInModal("SIGN_IN");
    })

    queryElement("#sign-in2").addEventListener("click", () => {
        new LogInModal("LOG_IN");
    })

    queryElement("#register2").addEventListener("click", () => {
        new LogInModal("SIGN_IN");
    })
});
