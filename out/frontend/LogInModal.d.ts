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
export declare class LogInModal {
    private modal;
    private css;
    private logInTransition;
    private signUpTransition;
    private logInCard;
    private signInContent;
    private hiddableH4;
    private errorSignUp;
    private errorLogIn;
    private signUp;
    private logIn;
    private logInEmailField;
    private logInPasswordField;
    private signUpEmailField;
    private signUpPasswordField;
    private rememberMe1;
    private rememberMe2;
    /**
    * Creates in log in modal
    *
    * @param mode (string) - "LOG_IN" | "SIGN_IN"
    */
    constructor(mode: "LOG_IN" | "SIGN_IN");
    /**
    * Closes and destroys modal div
    */
    close(): void;
    /**
     * This fires when log in is clicked
     *
     * @param callback: () => void;
     * @returns void
     */
    onLogIn(callback: () => void): void;
    /**
     * This fires when sign up is clicked
     *
     * @param callback: () => void;
     * @returns void
     */
    onSignUp(callback: () => void): void;
    /**
     * Gets the text fields on sign up page
     */
    getSignUpFields(): {
        email: string;
        password: string;
        rememberMe: boolean;
    };
    /**
     * Gets the text fields on sign up page
     *
     */
    getLogInFields(): {
        email: string;
        password: string;
        rememberMe: boolean;
    };
    /**
    * Displays an error on the sign up modal
    *
    * @param errorMessage (string) - displays this message. Default: Invalid Email
    */
    displayErrorSignUp(errorMessage?: string): void;
    /**
    * Displays an error on the log in modal
    *
    * @param errorMessage (string) - displays this message. Default: Invalid Email or Password
    */
    displayErrorLogIn(errorMessage?: string): void;
    /**
    * Hides both error messages
    */
    hideErrorMessages(): void;
    private init;
    private initListners;
    _signUpUser(email: string, password: string): Promise<void>;
    _logInUser(email: string, password: string): Promise<void>;
    private modeLogIn;
    private modeSignUp;
    /**
    * Syncs both remember me checkboxes
    *
    * @param whichBox (1 | 2) tells which box was click
    */
    private syncRememberMe;
}
//# sourceMappingURL=LogInModal.d.ts.map