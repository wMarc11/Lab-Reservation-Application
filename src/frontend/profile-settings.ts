const deleteAccountButton = document.getElementById('deleteAccountBtn');

const modal = document.querySelector('#confirmModal') as HTMLDivElement;
const yesBtn = document.querySelector('#confirmYes') as HTMLButtonElement;
const noBtn = document.querySelector('#confirmNo') as HTMLButtonElement;

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