// @ts-nocheck

/*
##########################################################################

This section of the code is to allow dynamic change of floors when
users select different buildings in the reservation form.

##########################################################################
*/

const GOKS_FLOORS = `
    <option value="3rd Floor" selected> 3rd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
`

const STRC_FLOORS = `
    <option value="1st Floor" selected> 1st Floor </option>
    <option value="2nd Floor"> 2nd Floor </option>
    <option value="3rd Floor"> 3rd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
`

const SJ_FLOORS = `
    <option value="2nd Floor" selected> 2nd Floor </option>
    <option value="3rd Floor"> 3rd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
    <option value="5th Floor"> 5th Floor </option>
    <option value="6th Floor"> 6th Floor </option>
`

const LS_FLOORS = `
    <option value="2nd Floor" selected> 2nd Floor </option>
    <option value="3rd Floor"> 3rd Floor </option>
`

const MIGUEL_FLOORS = `
    <option value="1st Floor" selected> 1st Floor </option>
    <option value="2nd Floor"> 2nd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
`

const VELASCO_FLOORS = `
    <option value="1st Floor" selected> 1st Floor </option>
    <option value="2nd Floor"> 2nd Floor </option>
    <option value="3rd Floor"> 3rd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
    <option value="5th Floor"> 5th Floor </option>
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


/*
function populateFloor(event) {

    try {
        floor_select.innerHTML = floors[event.value];
    }
    catch(err) {
        // Defaults to Goks
        floor_select.innerHTML = floors['GH'];
    }
}*/

reservation_form.addEventListener('submit', (event) => {
    event.preventDefault();

    const building = document.getElementById('buildings').value;
    const floor = document.getElementById('floors').value;

    window.location.href = `block-slot-availability.html?building=${building}&floor=${floor}`;
});
