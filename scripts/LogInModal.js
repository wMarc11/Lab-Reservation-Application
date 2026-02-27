const { response } = require("express");

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
`
const ERROR_ICON = `<i class="fa-solid fa-circle-exclamation"></i>` 
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
/*export*/ class LogInModal {
    //this is ideally exported elsewhere, but i cant do export/imports without a server i think?

    /**
    * Creates in log in modal
    * 
    * @param mode (string) - "LOG_IN" | "SIGN_IN"
    */
    constructor(mode) {
        if (typeof(mode) !== "string")
            console.error("LogInModal Error: mode arg for constructor must be a string!");

        if (mode !== "LOG_IN" && mode !== "SIGN_IN")
            console.error("LogInModal Error: mode string must be either LOG_IN or SIGN_IN!")

        this._init(mode);
    }

    /**
    * Closes and destroys modal div
    */
    close() {
        this._modal.remove();
        this._css.remove();
        document.body.style.overflow = '';
    }

    /**
     * This fires when log in is clicked
     *
     * @param callback: () => void;
     * @returns void
     */
    onLogIn(callback) {
        this._logIn.addEventListener("click", callback);
    }

    /**
     * This fires when sign up is clicked
     *
     * @param callback: () => void;
     * @returns void
     */
    onSignUp(callback) {
        this._signUp.addEventListener("click", callback);
    }

    /**
     * Gets the text fields on sign up page
     * 
     * @returns {{ email: string, password: string, rememberMe: boolean}}
     */
    getSignUpFields() {
        return {
            email: this._signUpEmailField.value,
            password: this._signUpPasswordField.value,
            rememberMe: this._rememberMe1.checked || this._rememberMe2.checked,
        };
    }

    /**
     * Gets the text fields on sign up page
     * 
     * @returns {{ email: string, password: string, rememberMe: boolean}}
     */
    getLogInFields() {
        return {
            email: this._logInEmailField.value,
            password: this._logInPasswordField.value,
            rememberMe: this._rememberMe1.checked || this._rememberMe2.checked,
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
        this._errorSingUp.innerHTML = message;
        this._errorSingUp.classList.remove(`is-hidden`);
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
        this._errorLogIn.innerHTML = message;
        this._errorLogIn.classList.remove(`is-hidden`);
    }

    /**
    * Hides both error messages
    */
    hideErrorMessages() {
        this._errorSingUp.classList.add(`is-hidden`);
        this._errorLogIn.classList.add(`is-hidden`);
    }

    _init(mode) {
        window.scrollTo(0, 0);

        this._css = document.createElement("link")
        this._css.rel = "stylesheet";
        this._css.type = "text/css";
        this._css.href = 'styles/log-in-modal.css';
        document.head.appendChild(this._css);

        this._modal = document.createElement("div");
        this._modal.innerHTML = DIV;
        document.body.appendChild(this._modal);
        document.body.style.overflow = "hidden";
        this._initListners();

        console.log(this._logInTransition);

        if(mode === "LOG_IN")
            this._modeLogIn();
    }

    _initListners() {
        this._logInTransition = this._modal.querySelector("#log-in-transition");
        this._signUpTransition = this._modal.querySelector("#sign-up-transition");
        this._logInCard = this._modal.querySelector("#log-in-card");
        this._signInContent = this._modal.querySelector("#sign-in-content");
        this._hiddableH4 = this._modal.querySelector("#hiddable");
        this._errorSingUp = this._modal.querySelector("#error-sign-up");
        this._errorLogIn = this._modal.querySelector("#error-log-in");
        this._signUp = this._modal.querySelector("#sign-up");
        this._logIn = this._modal.querySelector("#log-in");
        this._logInEmailField = this._modal.querySelector("#log-in-email-field");
        this._logInPasswordField = this._modal.querySelector("#log-in-password-field");
        this._signUpEmailField = this._modal.querySelector("#sign-up-email-field");
        this._signUpPasswordField = this._modal.querySelector("#sign-up-password-field");
        this._rememberMe1 = this._modal.querySelector("#remember-me1");
        this._rememberMe2 = this._modal.querySelector("#remember-me2");

        this._logInTransition.addEventListener("click", () => {
            this._modeLogIn();
        })

        this._signUpTransition.addEventListener("click", () => {
            this._modeSignUp();
        })

        //TEST: There are for testing
        this._signUp.addEventListener("click",  () => {
            this.hideErrorMessages();

            const {email, password} = this.getSignUpFields();
            if (password === `invalid`)
                this.displayErrorSignUp();

        })

        //TEST: There are for testing
        this._logIn.addEventListener("click",  () => {
            this.hideErrorMessages();

            const {email, password} = this.getLogInFields();
            if (password === `invalid`)
                this.displayErrorLogIn(`Invalid Password`);
        })

        //when clicking off the modal
        const form = this._modal.querySelector(".form");
        this._modal.addEventListener("click", (e) => {
            if (form.contains(e.target)) {
                return;
            }

            this.close();
            console.log(`test lol`);
        });

        this._signUp.addEventListener("click", () => {
            console.log(this.getSignUpFields());
            const {email, password} = this.getSignUpFields();
            this._signUpUser(email, password);
        })

        this._logIn.addEventListener("click", () => {
            console.log(this.getLogInFields());
            const {email, password} = this.getLogInFields();
            this._logInUser(email, password);
        })

        this._rememberMe1.addEventListener("click", () => {
            this._syncRememberMe(1)
        });
        this._rememberMe2.addEventListener("click", () => {
            this._syncRememberMe(2)}
        );
    }

    async _signUpUser(email, password) {
        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ email: email, password: password }),
            });

            const data = await response.json();
            if (!response.ok) {
                this.displayErrorSignUp(data.message || "Sing up failed");
                return;
            }

            sessionStorage.setItem("user", data.user);
            window.location.href = "./dashboard.html";
        } catch {
            this.displayErrorSignUp("Network error");
        }
    }

    async _logInUser(email, password) {
        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ email: email, password: password , role: "student"}),
            })

            const data = await response.json();
            if (!response.ok) {
                this.displayErrorSignUp(data.message || "Log up failed");
                return;
            }

            sessionStorage.setItem("user", data.user);
            window.location.href = "./dashboard.html";
        } catch {
            this.displayErrorSignUp("Network error");
        }
    }

    _modeLogIn() {
        this._hiddableH4.classList.add("is-transparent");
        this._logInTransition.classList.add("is-transparent");
        this._logInCard.classList.add("form__panel--active");
        this._signInContent.classList.add("is-transparent");
    }

    _modeSignUp() {
        this._hiddableH4.classList.remove("is-transparent");
        this._logInTransition.classList.remove("is-transparent");
        this._logInCard.classList.remove("form__panel--active")
        this._signInContent.classList.remove("is-transparent");
    }

    /**
    * Syncs both remember me checkboxes
    *
    * @param whichBox (1 | 2) tells which box was click
    */
    _syncRememberMe(whichBox) {
        if (whichBox !== 1 && whichBox !== 2)
            console.error("Log In Modal Error: Invalid arg! whichBox must be either 1 or 2");

        if (whichBox === 1)
            this._rememberMe2.checked = !this._rememberMe2.checked;
        else
            this._rememberMe1.checked = !this._rememberMe1.checked;
    }
}

//this is ideally exported elsewhere, but i cant do export/imports without a server i think?
document.getElementById("sign-in").addEventListener("click", () => {
    new LogInModal("LOG_IN");
})

document.getElementById("register").addEventListener("click", () => {
    new LogInModal("SIGN_IN");
})

document.getElementById("sign-in2").addEventListener("click", () => {
    new LogInModal("LOG_IN");
})

document.getElementById("register2").addEventListener("click", () => {
    new LogInModal("SIGN_IN");
})
