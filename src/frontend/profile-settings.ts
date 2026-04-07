import { requestLogOut } from "./log-out.js";
import { queryElement, sleep } from "./util/frontendUtil.js";

const deleteAccountButton = document.getElementById('deleteAccountBtn');

const modal = document.querySelector('#confirmModal') as HTMLDivElement;
const yesBtn = document.querySelector('#confirmYes') as HTMLButtonElement;
const noBtn = document.querySelector('#confirmNo') as HTMLButtonElement;
const currentPassword = queryElement<HTMLInputElement>(`#current-password`);
const newPassword = queryElement<HTMLInputElement>(`#new-password`);
const confirmNewPassword = queryElement<HTMLInputElement>(`#confirm-new-password`);
const updatePassword = queryElement<HTMLButtonElement>("#update-password");
const passwordMessage = queryElement<HTMLParagraphElement>("#password-message")

deleteAccountButton?.addEventListener('click' ,() => {
    modal.style.display = "flex";
});

noBtn.addEventListener('click', () => {
    modal.style.display = "none";
});

yesBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/delete-account', {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            console.log('successful', data.message);
            window.location.href = '/index.html'; 
        } else {
            console.error('Unsuccessful', data.message);
        }
    } catch (err) {
        console.error('Network error:', err);
    }
})

updatePassword.addEventListener("click", async () => {
    console.log(`test`);
    try {
        const response = await fetch(`/change-password`, {
            method: `PUT`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: currentPassword.value, 
                newPassword: newPassword.value, 
                confirmNewPassword: confirmNewPassword.value
            }),
        })

        const test = await response.text();
        console.log("status:", response.status, "body:", test);
        const data = await response.json();
        let messageClass = "success";
        if (!response.ok)
            messageClass = "error";


        passwordMessage.innerHTML = data.message;
        passwordMessage.classList.add(messageClass);
        passwordMessage.classList.remove("hidden");

        if (response.ok) {
            await requestLogOut(false);
            await sleep(2500);
            window.location.href = "index.html"
        }
    } catch (error) {
        console.error(error);
    }
})
