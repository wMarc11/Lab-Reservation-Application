"use strict";
// @ts-nocheck
/*
##########################################################################

This section of the code is to allow dynamic change of floors when
users select different buildings in the reservation form.

##########################################################################
*/
const GOKS_FLOORS = `
    <option value="3" selected> 3rd Floor </option>
    <option value="4"> 4th Floor </option>
`;
const STRC_FLOORS = `
    <option value="1" selected> 1st Floor </option>
    <option value="2"> 2nd Floor </option>
    <option value="3"> 3rd Floor </option>
    <option value="4"> 4th Floor </option>
`;
const SJ_FLOORS = `
    <option value="2" selected> 2nd Floor </option>
    <option value="3"> 3rd Floor </option>
    <option value="4> 4th Floor </option>
    <option value="5"> 5th Floor </option>
    <option value="6"> 6th Floor </option>
`;
const LS_FLOORS = `
    <option value="2" selected> 2nd Floor </option>
    <option value="3"> 3rd Floor </option>
`;
const MIGUEL_FLOORS = `
    <option value="1" selected> 1st Floor </option>
    <option value="2"> 2nd Floor </option>
    <option value="4"> 4th Floor </option>
`;
const VELASCO_FLOORS = `
    <option value="1" selected> 1st Floor </option>
    <option value="2> 2nd Floor </option>
    <option value="3> 3rd Floor </option>
    <option value="4"> 4th Floor </option>
    <option value="5"> 5th Floor </option>
`;
const reservation_form = document.getElementById('reservation_form');
const floor_select = document.getElementById('floors');
const floors = {
    'GH': GOKS_FLOORS,
    'STRC': STRC_FLOORS,
    'SJ': SJ_FLOORS,
    'LS': LS_FLOORS,
    'MH': MIGUEL_FLOORS,
    'VH': VELASCO_FLOORS
};
const handleBuildingChange = (obj) => {
    populateFloor(obj);
};
function populateFloor(event) {
    try {
        floor_select.innerHTML = floors[event.value];
    }
    catch (err) {
        floor_select.innerHTML = floors['GH'];
    }
}
reservation_form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const building = document.getElementById('buildings').value;
    const floor = document.getElementById('floors').value;
    const capacity = document.getElementById('capacities').value;
    const result = await viewReservations(building, floor, capacity);
});
async function viewReservations(building, floor, capacity) {
    try {
        const query = new URLSearchParams({ building, floor }).toString();
        const response = await fetch(`/reservation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ building, floor, capacity })
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
            sessionStorage.setItem('capacity', capacity);
        }
        else {
            console.log("Server error: ", data.message);
        }
    }
    catch (error) {
        console.log("Network error:", error);
    }
}
//# sourceMappingURL=reservation.js.map