export function setInnerHTML(id, innerHTML) {
    if (!id.startsWith("#"))
        console.warn(`Arg id: ${id} should start with a # if an id, ignore if on purpose`);
    const element = document.querySelector(id);
    if (!element) {
        console.error(`Element of id ${id} not found!`);
        return;
    }
    element.innerHTML = innerHTML;
}
export function getValidUser(user) {
    return user ?? "User";
}
export function formatDateTime(dateTime) {
    const { year, month, day, time } = dateTime;
    const { hour, minute } = time;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const minuteStr = minute.toString().padStart(2, "0");
    return `${month}/${day}/${year}, ${hour12}:${minuteStr}:00 ${ampm}`;
}
export function formatShortDateTime(dt) {
    const dayDiff = computeDayDifferenceFromToday(dt);
    let dayStr;
    if (dayDiff === 0)
        dayStr = "Today";
    else if (dayDiff === 1)
        dayStr = "Tomorrow";
    else if (dayDiff === -1)
        dayStr = "Yesterday";
    else
        dayStr = `${dt.month}/${dt.day}/${dt.year}`;
    const hour = dt.time.hour;
    const minute = dt.time.minute;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const minuteStr = minute.toString().padStart(2, "0");
    return `${dayStr} · ${hour12}:${minuteStr} ${ampm}`;
}
export function formatOneWordTime(dt) {
    const dayDiff = computeDayDifferenceFromToday(dt);
    let oneWord;
    if (dayDiff === 0)
        oneWord = "Today";
    else if (dayDiff === 1)
        oneWord = "Tomorrow";
    else if (dayDiff === -1)
        oneWord = "Yesterday";
    else
        oneWord = `${dt.month}/${dt.day}/${dt.year}`;
    return oneWord;
}
export function computeDayDifferenceFromToday(dt) {
    const now = new Date();
    const dtDate = new Date(dt.year, dt.month - 1, dt.day, dt.time.hour, dt.time.minute);
    const oneDayMs = 24 * 60 * 60 * 1000;
    const dayDiff = Math.floor((dtDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / oneDayMs);
    return dayDiff;
}
export function getReservationCountInfo(reservations) {
    return {
        noOfReservations: reservations.length,
        noOfToday: reservations.filter((reservation) => reservation.status === "Today").length,
        noOfUpcoming: reservations.filter((reservation) => reservation.status === "Upcoming").length,
    };
}
//# sourceMappingURL=Helper.js.map