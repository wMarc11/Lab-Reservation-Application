"use strict";
// @ts-nocheck
const M101_HEADER = `M101 - Material Testing Laboratory`;
const M104D_HEADER = `M104D - ECE Thesis Room`;
const GK302A_HEADER = `GK302A - Computer Lab`;
const SJ605_HEADER = `SJ605 - Microbiology Research Lab`;
let roomNumber = `I get wet at the thought of you uh huh`;
const tableModal = `
    <div class="table">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect width="700" height="100" fill="var(--color-info-dark)" />
        </svg>
    </div>
`;
const greenSeatModal = `
    <svg viewBox="0 0 100 100">
        <circle r="45" cx="50" cy="50" fill="#8FC991" />
            <text class="number" x="50" y="55">${roomNumber} Yaoi</text>
    </svg>
`;
const redSeatModal = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <circle r="45" cx="50" cy="50" fill="#F06F65" />
            <text class="number" x="50" y="55">${roomNumber}</text>
    </svg>
`;
const availableButtonModal = `
    <div class="seat-dropdown">
        <p>Status: Available</p>
        <button type="button" class="reserve">
            Reserve
        </button>
    </div>
`;
const unavailableButtonModal = `
    <div class="seat-dropdown">
        <p>Status: Reserved</p>
            <p>By: <a href="other-profile.html?id=2" class="user">John Doe</a></span></p>
    </div>
`;
const GK301_TEXT = `

    <div class="display-seat-row row-spread">
        ${tableModal}
        ${tableModal}
    </div>

    <div class="display-seat-row row-spread">
        <div class="seat-group">
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${redSeatModal}
                ${unavailableButtonModal}
            </div>
        </div>

        <div class="seat-group">
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
    </div>


    <div class="display-seat-row row-spread">
        ${tableModal}
        ${tableModal}
        ${tableModal}
    </div>

    <div class="display-seat-row row-spread">
        <div class="seat-group">
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
        <div class="seat-group">
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
        <div class="seat-group">
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
    </div>

    <div class="display-seat-row row-spread">
        ${tableModal}
        ${tableModal}
        ${tableModal}
    </div>

    <div class="display-seat-row row-spread">
        <div class="seat-group">
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
        <div class="seat-group">
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
        <div class="seat-group">
            <div class="seat">
                ${redSeatModal}
                ${unavailableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
    </div>

    <div class="display-seat-row row-spread">
        ${tableModal}
        ${tableModal}
        ${tableModal}
    </div>

    <div class="display-seat-row row-spread">
        <div class="seat-group">
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
        <div class="seat-group">
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
        <div class="seat-group">
            <div class="seat">
                ${redSeatModal}
                ${unavailableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
            <div class="seat">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
    </div>
`;
const GK301_HEADER = `GK301 - Computer Lab`;
const GK302A_TEXT = `
<div class="display-seat-row row-spread">
    <div class="seat-group-col" style="margin-left:17.5rem;">
        <div class="seat col">
            ${redSeatModal}
            ${unavailableButtonModal}
        </div>
        <div class="seat col">
            ${redSeatModal}
            ${unavailableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col" style="margin-right:10.5rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    <div class="seat-group-col">
        <div class="seat col">
            ${redSeatModal}
            ${unavailableButtonModal}
        </div>
        <div class="seat col">
            ${redSeatModal}
            ${unavailableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>
</div>

<div class="display-seat-row row-spread">
    <div class="seat-group-col" style="margin-left:17.5rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col" style="margin-right: 10.5rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>
</div>

<div class="display-seat-row row-spread">
    ${tableModal}
    <div class="seat col">
        ${greenSeatModal}
        ${availableButtonModal}
    </div>

    <div class="seat-group-col" style="margin-left: 9rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col" style="margin-right:10.5rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">  
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>
</div>
    ${tableModal}
    <div class="display-seat-row row-spread">
        <div class="seat-group-col" style="margin-left:51.4rem; margin-top: -1rem">
            <div class="seat col">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
    </div>
</div>
`;
const GK306A_HEADER = `GK306 - Computer Lab`;
const GK306A_TEXT = `
<div class="display-seat-row row-spread">
    <div class="seat-group-col" style="margin-left:17.5rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col" style="margin-right:10.5rem;">
        <div class="seat col">
            ${redSeatModal}
            ${unavailableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>
</div>

<div class="display-seat-row row-spread">
    <div class="seat-group-col" style="margin-left:17.5rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col" style="margin-right: 10.5rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>
</div>

<div class="display-seat-row row-spread">
    ${tableModal}
    <div class="seat col">
        ${greenSeatModal}
        ${availableButtonModal}
    </div>

    <div class="seat-group-col" style="margin-left: 9rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col" style="margin-right:10.5rem;">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>

    ${tableModal}
    ${tableModal}

    <div class="seat-group-col">
        <div class="seat col">
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
        <div class="seat col">  
            ${greenSeatModal}
            ${availableButtonModal}
        </div>
    </div>
</div>
    ${tableModal}
    <div class="display-seat-row row-spread">
        <div class="seat-group-col" style="margin-left:51.4rem; margin-top: -1rem">
            <div class="seat col">
                ${greenSeatModal}
                ${availableButtonModal}
            </div>
        </div>
    </svg>
</div>
`;
const seats = {
    'SJ605': { SJ605_HEADER, SJ605_TEXT },
    'GK301': { GK301_HEADER, GK301_TEXT },
    'GK302A': { GK302A_HEADER, GK302A_TEXT },
    'M104D': { M104D_HEADER, M104D_TEXT },
    'M101': { M101_HEADER, M101_TEXT },
    'GK306A': { GK306A_HEADER, GK306A_TEXT }
};
const display_seat = document.querySelector('.display-seat');
const header_container = document.querySelector('.seat-reservation-information');
const heading = header_container.querySelector('h1');
function initialize(roomCode) {
    displayAvailableSeats(roomCode);
}
function displayAvailableSeats(roomCode) {
    const room = seats[roomCode];
    if (!room)
        return;
    heading.textContent = room[`${roomCode}_HEADER`];
    display_seat.innerHTML += room[`${roomCode}_TEXT`];
}
display_seat.addEventListener("click", (e) => {
    const seat = e.target.closest(".seat");
    const dropdown = seat.querySelector(".seat-dropdown");
    document.querySelectorAll(".seat-dropdown").forEach(d => {
        if (d !== dropdown)
            d.style.display = "none";
    });
    if (dropdown.style.display === "flex") {
        dropdown.style.display = "none";
    }
    else {
        dropdown.style.display = "flex";
        dropdown.style.flexDirection = "column";
    }
});
const params = new URLSearchParams(window.location.search);
let roomCode = params.get("room");
console.log(roomCode);
initialize(roomCode);
let reservation_count = 0;
const reservation_counter = document.getElementById('reservation-counter');
reservation_counter.textContent = reservation_count;
document.querySelectorAll('.reserve').forEach(button => {
    button.addEventListener('click', function () {
        this.disabled = true;
        reservation_count++;
        reservation_counter.textContent = reservation_count;
    });
});
const reserve_all_button = document.getElementById('reserve-all-button');
reserve_all_button.addEventListener('click', redirectToReservationForm);
async function redirectToReservationForm() {
    try {
        let start = sessionStorage.getItem('time');
        let startDate = new Date();
        const [time, modifier] = start.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12)
            hours += 12;
        if (modifier === 'AM' && hours === 12)
            hours = 0;
        startDate.setHours(hours);
        startDate.setMinutes(minutes + 30);
        let end = startDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        const response = await fetch('/seat-reservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                building: sessionStorage.getItem('building'),
                floor: sessionStorage.getItem('floor'),
                totalSeats: reservation_count,
                room: sessionStorage.getItem('room'),
                date: sessionStorage.getItem('date'),
                startTime: start,
                endTime: end
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log('success');
            sessionStorage.clear();
            window.location.href = `reservation.html`;
        }
        else {
            console.log('unsuccessful');
        }
    }
    catch (err) {
        console.log("Network error:", err);
    }
}
//# sourceMappingURL=seat-reservation.js.map