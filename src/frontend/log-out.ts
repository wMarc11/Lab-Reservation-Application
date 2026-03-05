
const logout = document.getElementById('logout-anchor');

logout?.addEventListener('click', () => {
    sessionStorage.removeItem('user');
    requestLogOut();
})

async function requestLogOut() {
    try {
        const response = await fetch('/logout', {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            console.log('successful', data.message);
        }
        else {
            console.error('unsuccesful response', data.message);
        }
    }
    catch (err) {
        console.error('unsuccessful', err);
    }
}