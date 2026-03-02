import { queryElement } from "./util/frontendUtil.js";
const BASE_URL = "http://localhost:3000";
const DIV = `
        <div class="overlay">
            <div class="form">
                <div class="form__content" id="sign-in-content">
                    <h1>Sign Up</h1>
                    <button class="form__button" type="button">
                        <i class="fa-brands fa-google"></i>
                        Sign in with Google
                    </button>
                    <h2>or use your email password</h2>
                    <p class="is-hidden form__error" id="error-sign-up">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        Invalid Email or Password
                    </p>
                    <div class="form__input-box">
                        <input class="form__input" id="sign-up-email-field" type="text" placeholder="Email" required>
                        <i class="form__input-icon fa-regular fa-user"></i>
                    </div>
                    <div class="form__input-box">
                        <input class="form__input" id="sign-up-password-field" type="password" placeholder="Password" required>
                        <i class="form__input-icon fa-solid fa-lock"></i>
                    </div>
                    <button class="form__button" type="button" id="sign-up">
                        Sign up
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                    <div class="form__remember-me">
                        <input type="checkbox" id="remember-me1" class="form__remember-me-checkbox">
                        <p>Remember me</p>
                    </div>
                </div>
                <div class="form__panel" id="log-in-card">
                    <div class="form__content" >
                        <h4 id="hiddable">Already have an account?</h4>
                        <button class="form__button form__button--outline" id="log-in-transition" type="button">Log In</button>
                        <h1>Log In</h1>
                        <button class="form__button form__button--dark" type="button">
                            <i class="fa-brands fa-google"></i>
                            Log in with Google
                        </button>
                        <h2>or use your email password</h2>
                        <p class="is-hidden form__error" id="error-log-in">
                            <i class="fa-solid fa-circle-exclamation"></i>
                            Invalid Email
                        </p>
                        <div class="form__input-box">
                            <input class="form__input" id="log-in-email-field" type="text" placeholder="Email">
                            <i class="form__input-icon fa-regular fa-user"></i>
                        </div>
                        <div class="form__input-box">
                            <input class="form__input" id="log-in-password-field" type="password" placeholder="Password">
                            <i class="form__input-icon fa-solid fa-lock"></i>
                        </div>
                        <button class="form__button form__button--dark" type="button" id="log-in">
                            Log in
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                        <div class="form__remember-me">
                            <input type="checkbox" id="remember-me2" class="form__remember-me-checkbox">
                            <p>Remember me</p>
                        </div>
                        <h4>Don't have an account?</h4>
                        <button class="form__button form__button--outline" id="sign-up-transition" type="button">Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
`;
const ERROR_ICON = `<i class="fa-solid fa-circle-exclamation"></i>`;
/**
 * LogInModal
 *
 * Creates a login/sign-up modal that can be displayed anywhere on the page.
 *
 * Usage:
 *   new LogInModal("SIGN_IN"); // Opens in Sign Up mode
 *   new LogInModal("LOG_IN");  // Opens in Log In mode
 *
 * Methods:
 * - close(): closes and removes the modal from the DOM
 */
export class LogInModal {
    /**
    * Creates in log in modal
    *
    * @param mode (string) - "LOG_IN" | "SIGN_IN"
    */
    constructor(mode) {
        if (typeof (mode) !== "string")
            console.error("LogInModal Error: mode arg for constructor must be a string!");
        if (mode !== "LOG_IN" && mode !== "SIGN_IN")
            console.error("LogInModal Error: mode string must be either LOG_IN or SIGN_IN!");
        this.init(mode);
    }
    /**
    * Closes and destroys modal div
    */
    close() {
        this.modal.remove();
        this.css.remove();
        document.body.style.overflow = '';
    }
    /**
     * This fires when log in is clicked
     *
     * @param callback: () => void;
     * @returns void
     */
    onLogIn(callback) {
        this.logIn.addEventListener("click", callback);
    }
    /**
     * This fires when sign up is clicked
     *
     * @param callback: () => void;
     * @returns void
     */
    onSignUp(callback) {
        this.signUp.addEventListener("click", callback);
    }
    /**
     * Gets the text fields on sign up page
     */
    getSignUpFields() {
        return {
            email: this.signUpEmailField.value,
            password: this.signUpPasswordField.value,
            rememberMe: this.rememberMe1.checked || this.rememberMe2.checked,
        };
    }
    /**
     * Gets the text fields on sign up page
     *
     */
    getLogInFields() {
        return {
            email: this.logInEmailField.value,
            password: this.logInPasswordField.value,
            rememberMe: this.rememberMe1.checked || this.rememberMe2.checked,
        };
    }
    /**
    * Displays an error on the sign up modal
    *
    * @param errorMessage (string) - displays this message. Default: Invalid Email
    */
    displayErrorSignUp(errorMessage = `Invalid Email`) {
        if (errorMessage === undefined) {
            console.warn(`LogInModal Warning: You might have forgot to put an error message`);
        }
        const message = ERROR_ICON + errorMessage;
        this.errorSignUp.innerHTML = message;
        this.errorSignUp.classList.remove(`is-hidden`);
    }
    /**
    * Displays an error on the log in modal
    *
    * @param errorMessage (string) - displays this message. Default: Invalid Email or Password
    */
    displayErrorLogIn(errorMessage = `Invalid Email or Password`) {
        if (errorMessage === undefined) {
            console.warn(`LogInModal Warning: You might have forgot to put an error message`);
        }
        const message = ERROR_ICON + errorMessage;
        this.errorLogIn.innerHTML = message;
        this.errorLogIn.classList.remove(`is-hidden`);
    }
    /**
    * Hides both error messages
    */
    hideErrorMessages() {
        this.errorSignUp.classList.add(`is-hidden`);
        this.errorLogIn.classList.add(`is-hidden`);
    }
    init(mode) {
        window.scrollTo(0, 0);
        this.css = document.createElement("link");
        this.css.rel = "stylesheet";
        this.css.type = "text/css";
        this.css.href = 'styles/log-in-modal.css';
        document.head.appendChild(this.css);
        this.modal = document.createElement("div");
        this.modal.innerHTML = DIV;
        document.body.appendChild(this.modal);
        document.body.style.overflow = "hidden";
        this.initListners();
        console.log(this.logInTransition);
        if (mode === "LOG_IN")
            this.modeLogIn();
    }
    initListners() {
        this.logInTransition = queryElement("#log-in-transition", this.modal);
        this.signUpTransition = queryElement("#sign-up-transition", this.modal);
        this.logInCard = queryElement("#log-in-card", this.modal);
        this.signInContent = queryElement("#sign-in-content", this.modal);
        this.hiddableH4 = queryElement("#hiddable", this.modal);
        this.errorSignUp = queryElement("#error-sign-up", this.modal);
        this.errorLogIn = queryElement("#error-log-in", this.modal);
        this.signUp = queryElement("#sign-up", this.modal);
        this.logIn = queryElement("#log-in", this.modal);
        this.logInEmailField = queryElement("#log-in-email-field", this.modal);
        this.logInPasswordField = queryElement("#log-in-password-field", this.modal);
        this.signUpEmailField = queryElement("#sign-up-email-field", this.modal);
        this.signUpPasswordField = queryElement("#sign-up-password-field", this.modal);
        this.rememberMe1 = queryElement("#remember-me1", this.modal);
        this.rememberMe2 = queryElement("#remember-me2", this.modal);
        this.logInTransition.addEventListener("click", () => {
            this.modeLogIn();
        });
        this.signUpTransition.addEventListener("click", () => {
            this.modeSignUp();
        });
        //TEST: There are for testing
        this.signUp.addEventListener("click", () => {
            this.hideErrorMessages();
            const { password } = this.getSignUpFields();
            if (password === `invalid`)
                this.displayErrorSignUp();
        });
        //TEST: There are for testing
        this.logIn.addEventListener("click", () => {
            this.hideErrorMessages();
            const { password } = this.getLogInFields();
            if (password === `invalid`)
                this.displayErrorLogIn(`Invalid Password`);
        });
        //when clicking off the modal
        const form = this.modal.querySelector(".form");
        this.modal.addEventListener("click", (e) => {
            if (form.contains(e.target)) {
                return;
            }
            this.close();
            console.log(`test lol`);
        });
        this.signUp.addEventListener("click", () => {
            console.log(this.getSignUpFields());
            const { email, password } = this.getSignUpFields();
            this._signUpUser(email, password);
        });
        this.logIn.addEventListener("click", () => {
            console.log(this.getLogInFields());
            const { email, password } = this.getLogInFields();
            this._logInUser(email, password);
        });
        this.rememberMe1.addEventListener("click", () => {
            this.syncRememberMe(1);
        });
        this.rememberMe2.addEventListener("click", () => {
            this.syncRememberMe(2);
        });
    }
    async _signUpUser(email, password) {
        try {
            const response = await fetch(`${BASE_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password }),
            });
            const data = await response.json();
            if (!response.ok) {
                this.displayErrorSignUp(data.message || "Sing up failed");
                return;
            }
            sessionStorage.setItem("user", data.user);
            window.location.href = "./dashboard.html";
        }
        catch {
            this.displayErrorSignUp("Network error");
        }
    }
    async _logInUser(email, password) {
        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password, role: "student" }),
            });
            const data = await response.json();
            if (!response.ok) {
                this.displayErrorLogIn(data.message || "Log up failed");
                return;
            }
            sessionStorage.setItem("user", data.user);
            window.location.href = "./dashboard.html";
        }
        catch {
            this.displayErrorLogIn("Network error");
        }
    }
    modeLogIn() {
        this.hiddableH4.classList.add("is-transparent");
        this.logInTransition.classList.add("is-transparent");
        this.logInCard.classList.add("form__panel--active");
        this.signInContent.classList.add("is-transparent");
    }
    modeSignUp() {
        this.hiddableH4.classList.remove("is-transparent");
        this.logInTransition.classList.remove("is-transparent");
        this.logInCard.classList.remove("form__panel--active");
        this.signInContent.classList.remove("is-transparent");
    }
    /**
    * Syncs both remember me checkboxes
    *
    * @param whichBox (1 | 2) tells which box was click
    */
    syncRememberMe(whichBox) {
        if (whichBox !== 1 && whichBox !== 2)
            console.error("Log In Modal Error: Invalid arg! whichBox must be either 1 or 2");
        if (whichBox === 1)
            this.rememberMe2.checked = !this.rememberMe2.checked;
        else
            this.rememberMe1.checked = !this.rememberMe1.checked;
    }
}
// document.addEventListener("DOMContentLoaded", () => {
//     document.getElementById("sign-in").addEventListener("click", () => {
//         new LogInModal("LOG_IN");
//     })
//
//     document.getElementById("register").addEventListener("click", () => {
//         new LogInModal("SIGN_IN");
//     })
//
//     document.getElementById("sign-in2").addEventListener("click", () => {
//         new LogInModal("LOG_IN");
//     })
//
//     document.getElementById("register2").addEventListener("click", () => {
//         new LogInModal("SIGN_IN");
//     })
// });
//# sourceMappingURL=LogInModal.js.map