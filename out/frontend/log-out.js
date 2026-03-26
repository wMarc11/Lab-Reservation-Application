const logout = document.getElementById('logout-anchor');
logout?.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('user');
    requestLogOut();
});
export async function requestLogOut(sendToIndex = true) {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
            console.log('successful', data.message);
            if (sendToIndex)
                window.location.href = `index.html`;
        }
        else {
            console.error('unsuccesful response', data.message);
        }
    }
    catch (err) {
        console.error('unsuccessful', err);
    }
}
//# sourceMappingURL=log-out.js.map