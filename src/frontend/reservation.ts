// @ts-nocheck

/*
##########################################################################

This section of the code is to allow dynamic change of floors when
users select different buildings in the reservation form.

##########################################################################
*/

const isAdmin = sessionStorage.getItem('role') === 'admin';

const dashboardLink = document.querySelector('.sidebar a[href="dashboard.html"]');

document.addEventListener("DOMContentLoaded", async () => {
    let authOkay = false;

    try {
        const response = await fetch("/auth/me");
        console.log(response)
        if (response.ok) {
            authOkay = true;
        }
    } catch (e) {
        authOkay = false;
    }

    if (!authOkay) {
        const authLinks = document.getElementById("auth-links");
        authLinks?.remove();

        const backLink = document.getElementById("back-link");
        if (backLink) {
            backLink.style.fontWeight = "bold";
            backLink.style.display = "block";
        }
    }
});


if (isAdmin && dashboardLink) {
    dashboardLink.setAttribute('href', 'dashboard-admin.html');
}

const GOKS_FLOORS = `
    <option value="3" selected> 3rd Floor </option>
    <option value="4"> 4th Floor </option>
`

const STRC_FLOORS = `
    <option value="1" selected> 1st Floor </option>
    <option value="2"> 2nd Floor </option>
    <option value="3"> 3rd Floor </option>
    <option value="4"> 4th Floor </option>
`

const SJ_FLOORS = `
    <option value="2" selected> 2nd Floor </option>
    <option value="3"> 3rd Floor </option>
    <option value="4> 4th Floor </option>
    <option value="5"> 5th Floor </option>
    <option value="6"> 6th Floor </option>
`

const LS_FLOORS = `
    <option value="2" selected> 2nd Floor </option>
    <option value="3"> 3rd Floor </option>
`

const MIGUEL_FLOORS = `
    <option value="1" selected> 1st Floor </option>
    <option value="2"> 2nd Floor </option>
    <option value="4"> 4th Floor </option>
`

const VELASCO_FLOORS = `
    <option value="1" selected> 1st Floor </option>
    <option value="2"> 2nd Floor </option>
    <option value="3"> 3rd Floor </option>
    <option value="4"> 4th Floor </option>
    <option value="5"> 5th Floor </option>
`

const reservation_form = document.getElementById('reservation_form');
const floor_select = document.getElementById('floors');
const floors = {
    'GH': GOKS_FLOORS,
    'STRC': STRC_FLOORS,
    'SJ': SJ_FLOORS,
    'LS': LS_FLOORS,
    'MH': MIGUEL_FLOORS,
    'VH': VELASCO_FLOORS
}

function handleBuildingChange(building) {
    floor_select.innerHTML = floors[building.value] || floors['GH'];
}

document.getElementById('buildings').addEventListener('change', (e) => {
    handleBuildingChange(e.target);
});


reservation_form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const building = document.getElementById('buildings').value;
    const floor = document.getElementById('floors').value;

    const result = await viewReservations(building, floor);
});

async function viewReservations(building, floor) {
    try {
        const query = new URLSearchParams({ building, floor}).toString();
        const response = await fetch(`/reservation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ building, floor})
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log("View successful", data.message);
            window.location.href = `./view-slot-availability?${query}`;

            // To persist information when users eventually switch to view-slot
            // The reason for not choosing localStorage is that this is not really 
            // information that should be kept until the user makes the decision
            // to finally reserve
            
            sessionStorage.setItem('building', building);
            sessionStorage.setItem('floor', floor);
            
        } else {
            console.log("Server error: ", data.message);
        }
    } catch (error) {
        console.log("Network error:", error);
    }
}