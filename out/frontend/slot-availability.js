// @ts-nocheck
import { BUILDING_LABELS, getLabsForBuildingFloor, normalizeBuildingCode, parseFloorNumber } from "../shared/labSeatConfig.js";
const pageParams = new URLSearchParams(window.location.search);
const buildingCode = normalizeBuildingCode(pageParams.get("building") ?? sessionStorage.getItem("building"));
const floor = parseFloorNumber(pageParams.get("floor") ?? sessionStorage.getItem("floor"));
const availabilitySection = document.querySelector(".availability-section");
const heading = availabilitySection?.querySelector("h1");
const helperText = availabilitySection?.querySelector("p");
const dateInput = document.getElementById("start");
const dateButtons = document.querySelectorAll(".date-container button");
const table = document.querySelector(".search-table");
const today = new Date();
today.setHours(0, 0, 0, 0);
const maxBrowseDate = new Date(today);
maxBrowseDate.setDate(maxBrowseDate.getDate() + 6);
let currentDate = normalizeInitialDate(pageParams.get("date"));
let autoRefreshHandle = null;
document.addEventListener("DOMContentLoaded", async () => {
    let authOkay = false;
    try {
        const response = await fetch("/auth/me");
        if (response.ok) {
            authOkay = true;
        }
    }
    catch (e) {
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
    if (!buildingCode || !floor) {
        renderErrorState("Missing building or floor. Please start from the reservation form.");
        return;
    }
    configureDateInput();
    attachDateHandlers();
    await loadAvailability();
    startAutoRefresh();
});
window.addEventListener("beforeunload", () => {
    if (autoRefreshHandle) {
        window.clearInterval(autoRefreshHandle);
    }
});
function configureDateInput() {
    if (!dateInput) {
        return;
    }
    dateInput.min = formatDateInputValue(today);
    dateInput.max = formatDateInputValue(maxBrowseDate);
    dateInput.value = formatDateInputValue(currentDate);
}
function attachDateHandlers() {
    if (dateInput) {
        dateInput.addEventListener("change", async () => {
            const selectedDate = new Date(dateInput.value);
            if (Number.isNaN(selectedDate.getTime())) {
                return;
            }
            if (selectedDate.getTime() < today.getTime()) {
                currentDate = new Date(today);
            }
            else if (selectedDate.getTime() > maxBrowseDate.getTime()) {
                currentDate = new Date(maxBrowseDate);
            }
            else {
                currentDate = selectedDate;
            }
            dateInput.value = formatDateInputValue(currentDate);
            await loadAvailability();
        });
    }
    const previousButton = dateButtons[0];
    const nextButton = dateButtons[1];
    previousButton?.addEventListener("click", async (event) => {
        event.preventDefault();
        const previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate() - 1);
        if (previousDate.getTime() < today.getTime()) {
            return;
        }
        currentDate = previousDate;
        if (dateInput) {
            dateInput.value = formatDateInputValue(currentDate);
        }
        await loadAvailability();
    });
    nextButton?.addEventListener("click", async (event) => {
        event.preventDefault();
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        if (nextDate.getTime() > maxBrowseDate.getTime()) {
            return;
        }
        currentDate = nextDate;
        if (dateInput) {
            dateInput.value = formatDateInputValue(currentDate);
        }
        await loadAvailability();
    });
}
async function loadAvailability() {
    const dateValue = formatDateInputValue(currentDate);
    const roomNames = getLabsForBuildingFloor(buildingCode, floor);
    if (heading) {
        heading.textContent = `${BUILDING_LABELS[buildingCode] ?? buildingCode} • Floor ${floor} • ${formatHeadingDate(currentDate)}`;
    }
    if (helperText) {
        helperText.textContent = "Browse 30-minute slots for the next 7 days. Green means seats are still available.";
    }
    if (roomNames.length === 0) {
        renderErrorState("No laboratory rooms are configured for this building and floor yet.");
        return;
    }
    try {
        const query = new URLSearchParams({
            building: buildingCode,
            floor: String(floor),
            date: dateValue
        });
        const response = await fetch(`/availability?${query.toString()}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to load availability");
        }
        renderAvailabilityTable(data.rooms ?? []);
    }
    catch (error) {
        renderErrorState(error.message || "Unable to load availability right now.");
    }
}
function startAutoRefresh() {
    autoRefreshHandle = window.setInterval(loadAvailability, 15000);
}
function renderAvailabilityTable(rooms) {
    if (!table) {
        return;
    }
    const slotDefinitions = buildSlotDefinitions(formatDateInputValue(currentDate));
    const headerRow = `
        <tr>
            <th class="room-col sticky-col">Rooms</th>
            ${slotDefinitions.map((slot) => `<th class="sticky-col">${slot.label}</th>`).join("")}
        </tr>
    `;
    const bodyRows = rooms.map((roomEntry) => {
        const slotCells = slotDefinitions.map((slot) => {
            const roomSlot = roomEntry.slots.find((entry) => utcToLocal(entry.startTime) === slot.startTime && utcToLocal(entry.endTime) === slot.endTime)
                ?? { occupiedCount: 0, remainingSeats: roomEntry.capacity, status: "available" };
            console.log(`Rendering slot: ${slot.startTime} and ${slot.endTime}, Occupied: ${roomSlot.occupiedCount}, Remaining: ${roomSlot.remainingSeats}`);
            const cellInfo = getCellPresentation(roomSlot, roomEntry.capacity);
            const query = new URLSearchParams({
                building: buildingCode,
                floor: String(floor),
                room: roomEntry.room,
                date: formatDateInputValue(currentDate),
                startTime: slot.startTime,
                endTime: slot.endTime
            });
            return `
                <td class="room-data" style="background-color:${cellInfo.background};">
                    <a href="seat-reservation.html?${query.toString()}" style="display:block; color:#111827; font-weight:600;">
                        ${cellInfo.label}
                    </a>
                </td>
            `;
        }).join("");
        return `
            <tr>
                <td class="room-data sticky-col" style="background-color:#66C2E0; color:#111827; font-weight:700;">${roomEntry.room}</td>
                ${slotCells}
            </tr>
        `;
    }).join("");
    table.innerHTML = `${headerRow}${bodyRows}`;
}
function renderErrorState(message) {
    if (heading) {
        heading.textContent = "Slot Availability";
    }
    if (helperText) {
        helperText.textContent = message;
    }
    if (table) {
        table.innerHTML = `
            <tr>
                <th class="room-col sticky-col">Rooms</th>
            </tr>
            <tr>
                <td class="room-data" style="padding:1rem; color:#111827;">${message}</td>
            </tr>
        `;
    }
}
function getCellPresentation(slot, capacity) {
    if (slot.status === "full" || slot.remainingSeats <= 0) {
        return {
            background: "#e37488",
            label: "Full"
        };
    }
    if (slot.occupiedCount > 0) {
        return {
            background: "#bfead1",
            label: `${slot.remainingSeats}/${capacity} free`
        };
    }
    return {
        background: "#a2f2b6",
        label: `${capacity}/${capacity} free`
    };
}
function buildSlotDefinitions(dateValue) {
    const slots = [];
    for (let hour = 8; hour < 18; hour += 1) {
        for (const minute of [0, 30]) {
            const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            const displayDate = new Date(`${dateValue}T${startTime}:00`);
            slots.push({
                startTime,
                endTime: minute === 30
                    ? `${String(hour + 1).padStart(2, "0")}:00`
                    : `${String(hour).padStart(2, "0")}:30`,
                label: displayDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                })
            });
        }
    }
    return slots;
}
function normalizeInitialDate(rawDate) {
    if (!rawDate) {
        return new Date(today);
    }
    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
        return new Date(today);
    }
    parsedDate.setHours(0, 0, 0, 0);
    if (parsedDate.getTime() < today.getTime()) {
        return new Date(today);
    }
    if (parsedDate.getTime() > maxBrowseDate.getTime()) {
        return new Date(maxBrowseDate);
    }
    return parsedDate;
}
function formatDateInputValue(dateValue) {
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const day = String(dateValue.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function formatHeadingDate(dateValue) {
    return dateValue.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}
function utcToLocal(time) {
    if (!time)
        return null;
    let [hours, minutes] = time.split(":").map(Number);
    hours = (hours + 8) % 24;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
//# sourceMappingURL=slot-availability.js.map