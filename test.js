const logInTransition = document.getElementById("log-in-transition");
const signUpTransition  = document.getElementById("sign-up-transition");
const logInCard = document.getElementById("log-in-card");
const signInContent = document.getElementById("sign-in-content");
const hiddableH4 = document.getElementById("hiddable")

logInTransition.addEventListener("click", () => {
    hiddableH4.classList.add("is-transparent");
    logInTransition.classList.add("is-transparent");
    logInCard.classList.add("form__panel--active");
    signInContent.classList.add("is-transparent");
})

signUpTransition.addEventListener("click", () => {
    hiddableH4.classList.remove("is-transparent");
    logInTransition.classList.remove("is-transparent");
    logInCard.classList.remove("form__panel--active")
    signInContent.classList.remove("is-transparent");
})

