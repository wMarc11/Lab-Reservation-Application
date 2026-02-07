
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

const handleBuildingChange = (obj) => {
    populateFloor(obj);
}

function populateFloor(event) {

    try {
        floor_select.innerHTML = floors[event.value];
    }
    catch(err) {
        // Defaults to Goks
        floor_select.innerHTML = floors['GH'];
    }
}

/*
##########################################################################

This section of the code is to dynamically add the different rooms
in the table and populate it with the necessary information in the 
time section of the table. 

##########################################################################
*/

const GOKS_ROOMS_3 = [
    'GK301', 
    'GK302', 
    'GK302B', 
    'GK304A', 
    'GK304B', 
    'GK306A', 
    'GK306B'
];

const GOKS_ROOMS_4 = [
    'GK404', 
    'GK405', 
    'GK407'
];

const STRC_ROOMS_1 = [
    'STRC105', 
    'STRC109', 
    'STRC108', 
    'STRC110', 
    'STRC111', 
    'STRC114', 
    'STRC116'
];

const STRC_ROOMS_2 = [
    'STRC204', 
    'STRC205', 
    'STRC208', 
    'STRC211', 
    'STRC213', 
    'STRC218', 
    'STRC219'
];

const STRC_ROOMS_3 = [
    'STRC312',
    'STRC314_316',
    'STRC316',
    'STRC317',
    'STRC319',
    'STRC315B',
    'STRC301',
    'STRC303',
    'STRC304',
    'STRC305',
    'STRC306',
    'STRC307',
    'STRC309',
    'STRC310',
    'STRC311'
];

const STRC_ROOMS_4 = [
    'STRC414',
    'STRC404',
    'STRC406',
    'STRC407',
    'STRC408',
    'STRC409',
    'STRC410',
    'STRC411',
    'STRC413'
];

const SJ_LAB_ROOMS_2 = [
    'SJ LAB212',
];

const SJ_LAB_ROOMS_3 = [
    'SJ LAB311_312',
    'SJ LAB311_313',
];

const SJ_ROOMS_4 = [
    'SJ LAB4 03',
    'SJ LAB4 04',
    'SJ LAB4 05',
    'SJ LAB4 08',
    'SJ LAB402',
    'SJ LAB407',
    'SJ LAB409',
    'SJ LAB410',
    'SJ LAB411',
    'SJ LAB412',
    'SJ LAB413',
];

const SJ_LAB_ROOMS_5 = [
    'SJ LAB506',
    'SJ LAB507',
    'SJ LAB511',
    'SJ LAB512'
];

const SJ_ROOMS_6 = [
    'SJ 605',
    'SJ 607',
    'SJ 608',
    'SJ 609',
    'SJ 610',
    'SJ 611A',
    'SJ 611B',
    'SJ 612',
    'SJ 613B',
    'SJ 613C',
    'SJ 613D',
    'SJ 614',
    'SJ LAB603'
];

const LS_ROOMS_2 = [
    'LS 212A'
];

const LS_ROOMS_3 = [
    'LS 301',
    'LS 320',
    'LS 335',
    'LS 335'
];

const MIGUEL_ROOMS_1 = [
    'M101',
    'M103A_B',
    'M104D',
    'M104E',
    'M105 MEZZ',
    'M105',
    'M106',
    'M108',
    'M112',
    'M117',
    'M157'
];

const MIGUEL_ROOMS_2 = [
    'M201',
    'M207',
    'M210',
    'M213',
    'M214',
    'M217'
];

const MIGUEL_ROOMS_4 = [
    'M401',
    'M402_TECH',
    'M402A',
    'M402C',
    'M404',
    'M405'
];

const VELASCO_ROOMS_1 = [
    'V101',
    'V102D',
    'V103',
    'V109',
];

const VELASCO_ROOMS_2 = [
    'V208A',
    'V208B',
];

const VELASCO_ROOMS_3 = [
    'V301',
    'V302',
    'V303A',
    'V303B - FACULTY',
    'V303B',
    'V311',
    'V312'
];

const VELASCO_ROOMS_4 = [
    'V402',
    'V403',
    'V404A',
    'V409',
    'V410B',
    'V411',
    'V412',
    'V413',
    'V414',
    'V415'
];

const VELASCO_ROOMS_5 = [
    'V505',
    'V506',
    'V511',
    'V512',
    'V513'
];


