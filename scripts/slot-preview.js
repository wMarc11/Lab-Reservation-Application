
/*
##########################################################################

This section of the code is to display dates properly on the front-end
side, specifically at the heading container.

##########################################################################
*/

const info_container = document.querySelector('.availability-section');
const heading = info_container.querySelector('h1');

const today = new Date();
const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
};

const formattedDate = today.toLocaleDateString('en-US', options);
heading.innerText = formattedDate;

/*
##########################################################################

This section of the code is to dynamically add the different rooms
in the table and populate it with the necessary information in the 
time section of the table. 

##########################################################################
*/

const BUILDING_DATA = {
    GOKS_3: [
        'GK301', 
        'GK302A', 
        'GK302B', 
        'GK304A', 
        'GK304B', 
        'GK306A', 
        'GK306B'
    ],
    GOKS_4: [
        'GK404', 
        'GK405', 
        'GK407'
    ],
    STRC_1: [
        'STRC105', 
        'STRC109', 
        'STRC108', 
        'STRC110', 
        'STRC111', 
        'STRC114', 
        'STRC116'
    ],
    STRC_2: [
        'STRC204', 
        'STRC205', 
        'STRC208', 
        'STRC211', 
        'STRC213', 
        'STRC218', 
        'STRC219'
    ],
    STRC_3: [
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
    ],
    STRC_4: [
        'STRC414',
        'STRC404',
        'STRC406',
        'STRC407',
        'STRC408',
        'STRC409',
        'STRC410',
        'STRC411',
        'STRC413'
    ],
    SJ_2: [
        'SJ LAB212',
    ],
    SJ_3: [
        'SJ LAB311_312',
        'SJ LAB311_313'
    ],
    SJ_4: [
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
        'SJ LAB413'
    ],
    SJ_5: [
        'SJ LAB506',
        'SJ LAB507',
        'SJ LAB511',
        'SJ LAB512'
    ],
    SJ_6: [
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
    ],
    LS_ROOMS_2: [
        'LS 212A'
    ],
    LS_ROOMS_3: [
        'LS 301',
        'LS 320',
        'LS 335',
        'LS 335'
    ],
    MIGUEL_1: [
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
    ],
    MIGUEL_2: [
        'M201',
        'M207',
        'M210',
        'M213',
        'M214',
        'M217'
    ],
    MIGUEL_4: [
        'M401',
        'M402_TECH',
        'M402A',
        'M402C',
        'M404',
        'M405'
    ],
    VELASCO_1: [
        'V101',
        'V102D',
        'V103',
        'V109'
    ],
    VELASCO_2: [
        'V208A',
        'V208B'
    ],
    VELASCO_3: [
        'V301',
        'V302',
        'V303A',
        'V303B - FACULTY',
        'V303B',
        'V311',
        'V312'
    ],
    VELASCO_4: [
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
    ],
    VELASCO_5: [
        'V505',
        'V506',
        'V511',
        'V512',
        'V513'
    ]
}
function redirectToSeatReservation(roomCode) {
    window.location.href = `preview-seats.html?room=${roomCode}`;
}

function populateTable(roomCode, floor) {
    const rooms = BUILDING_DATA[`${roomCode.toUpperCase()}_${floor}`];
    const search_table = document.querySelector('.search-table');

    for (let room of rooms) {
        let row = search_table.insertRow(-1);
        let room_row = row.insertCell(0);
        room_row.className = 'room-data';
        room_row.textContent = room;

        for (var i = 1; i < 11; i++) {
            var cell = row.insertCell(i);
            cell.textContent = room;
            cell.style.color = "transparent";
        }
    }

    const cells = document.querySelectorAll('td');

    for (let i = 0; i < cells.length; i++) {
        if (cells[i].className != 'room-data') {
            cells[i].addEventListener('click', () => {
                redirectToSeatReservation(cells[i].textContent)
            });
        }
    }
}

function initialize(roomCode, floor) {
    if (!roomCode || !floor) {
        populateTable('GOKS', 3);
    } else {
        populateTable(roomCode, floor);
    }
}

const BUILDING_PREFIX = {
    GH: 'GOKS',
    STRC: 'STRC',
    SJ: 'SJ',
    LS: 'LS_ROOMS',
    MH: 'MIGUEL',
    VH: 'VELASCO'
};

const params = new URLSearchParams(window.location.search);
const buildingCode = params.get("building");
const floor = params.get("floor");
let floor_number = "";

if (floor) {
    floor_number = floor.match(/\d+/)[0];
}

console.log(floor_number);
console.log(buildingCode);

initialize(BUILDING_PREFIX[buildingCode], floor_number);