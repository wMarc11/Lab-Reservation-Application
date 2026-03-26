import { queryElement } from "./util/frontendUtil.js";
import { LogInModal } from "./LogInModal.js";
document.addEventListener("DOMContentLoaded", () => {
    queryElement("#sign-in").addEventListener("click", () => {
        new LogInModal("LOG_IN");
    });
    queryElement("#register").addEventListener("click", () => {
        new LogInModal("SIGN_IN");
    });
    queryElement("#sign-in2").addEventListener("click", () => {
        new LogInModal("LOG_IN");
    });
    queryElement("#register2").addEventListener("click", () => {
        new LogInModal("SIGN_IN");
    });
});
//# sourceMappingURL=home.js.map