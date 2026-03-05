const deleteAccountButton = document.getElementById('deleteAccountBtn');

deleteAccountButton?.addEventListener('click', async () => {
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