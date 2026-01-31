const GOKS_FLOORS = `
    <option value="3rd Floor"> 3rd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
`

const STRC_FLOORS = `
    <option value="1st Floor"> 1st Floor </option>
    <option value="2nd Floor"> 2nd Floor </option>
    <option value="3rd Floor"> 3rd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
`

const SJ_FLOORS = `
    <option value="3rd Floor"> 3rd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
    <option value="5th Floor"> 5th Floor </option>
    <option value="6th Floor"> 6th Floor </option>
`

const LS_FLOORS = `
    <option value="2nd Floor"> 2nd Floor </option>
    <option value="3rd Floor"> 3rd Floor </option>
`

const MIGUEL_FLOORS = `
    <option value="1st Floor"> 1st Floor </option>
    <option value="2nd Floor"> 2nd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
`

const VELASCO_FLOORS = `
    <option value="1st Floor"> 1st Floor </option>
    <option value="2nd Floor"> 2nd Floor </option>
    <option value="3rd Floor"> 3rd Floor </option>
    <option value="4th Floor"> 4th Floor </option>
    <option value="5th Floor"> 5th Floor </option>
`

const reservation_form = document.getElementById('reservation_form');
const floor_select = document.getElementById('floors');

const handleBuildingChange = (obj) => {
    populateFloor(obj);
}

function populateFloor(event) {
    var floors = {
        'GH': floor_select.innerHTML = GOKS_FLOORS,
        'STRC': floor_select.innerHTML = STRC_FLOORS,
        'SJ': floor_select.innerHTML = SJ_FLOORS,
        'LS': floor_select.innerHTML = LS_FLOORS,
        'MH': floor_select.innerHTML = MIGUEL_FLOORS,
        'VH': floor_select.innerHTML = VELASCO_FLOORS
    }

    try {
        floors[event.value]();
    }
    catch(err) {
        // Defaults to Goks
        floors['GH']();
    }
}