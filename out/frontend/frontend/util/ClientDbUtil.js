export var ClientDBUtil;
(function (ClientDBUtil) {
    /**
     * Gets the current logged in user ID from sessionStorage.
     * Redirects to home page if not logged in.
     */
    function getCurrentUserID() {
        const currentUserID = sessionStorage.getItem("user");
        if (currentUserID === null) {
            window.location.href = "index.html";
            throw new Error("Not logged in");
        }
        return currentUserID;
    }
    ClientDBUtil.getCurrentUserID = getCurrentUserID;
    /**
     * Gets the current logged in user's database object (like email, firstName) without password.
     *
     * @param userID - defaults to the currently logged in user
     * @returns the user object without password
     */
    async function getCurrentUser(userID = getCurrentUserID()) {
        const response = await fetch(`/users/${userID}`);
        if (!response.ok)
            throw new Error(`Request failed (${response.status})`);
        return response.json();
    }
    ClientDBUtil.getCurrentUser = getCurrentUser;
    /**
     * Gets the lab database object by its MongoDB _id.
     *
     * @param labID - the lab database _id
     * @returns the full lab object (LabDTO)
     */
    async function getLabObjectFromID(labID) {
        const response = await fetch(`/lab/id/${labID}`);
        if (!response.ok)
            throw new Error(`Request failed (${response.status})`);
        return response.json();
    }
    ClientDBUtil.getLabObjectFromID = getLabObjectFromID;
    /**
     * Gets the lab database object by its room code.
     *
     * @param labRoomCode - e.g., "GK201", "LS103"
     * @returns the full lab object (LabDTO)
     */
    async function getLabObjectFromLabCode(labRoomCode) {
        const response = await fetch(`/lab/name/${labRoomCode}`);
        if (!response.ok)
            throw new Error(`Request failed (${response.status})`);
        return response.json();
    }
    ClientDBUtil.getLabObjectFromLabCode = getLabObjectFromLabCode;
    /**
     * Gets the lab's database _id from its room code.
     *
     * @param labRoomCode - e.g., "GK201", "LS103"
     * @returns the lab's _id as a string
     */
    async function getLabIDFromLabCode(labRoomCode) {
        const labObject = await getLabObjectFromLabCode(labRoomCode);
        return labObject._id; //this can be done more effecient with a seperate GET, unfortunately im too lazy
    }
    ClientDBUtil.getLabIDFromLabCode = getLabIDFromLabCode;
    /**
     * Gets all reservations for the current user.
     *
     * @param userID - defaults to the currently logged in user
     * @returns an array of ReservationDTO objects
     */
    async function getCurrentReservations(userID = getCurrentUserID()) {
        const response = await fetch(`/reservations/user/${userID}`);
        if (!response.ok)
            throw new Error(`Request failed (${response.status})`);
        return response.json();
    }
    ClientDBUtil.getCurrentReservations = getCurrentReservations;
    /**
     * Gets reservation from id
     *
     * @param reservationID
     * @returns ReservationDTO objects
     */
    async function getReservationFromID(reservationID) {
        const response = await fetch(`/reservations/id/${reservationID}`);
        if (!response.ok)
            throw new Error(`Request failed (${response.status})`);
        return response.json();
    }
    ClientDBUtil.getReservationFromID = getReservationFromID;
    /**
     * Creates a new reservation for a lab.
     *
     * @param labRoomCode - room code of the lab (e.g., "GK201")
     * @param reservationData - reservation details without user, lab, or _id
     * @param userID - defaults to the currently logged in user
     * @returns the created reservation's _id
     */
    async function createReservation(labRoomCode, reservationData, userID = getCurrentUserID()) {
        const labID = await getLabIDFromLabCode(labRoomCode);
        const response = await fetch(`/reservations`, {
            method: "POST",
            body: JSON.stringify({ ...reservationData, lab: labID, user: userID }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message ?? "Failed to create reservation");
        }
        await logActivity({
            user: userID,
            action: "reserved",
            reservation: data.id,
            labName: labRoomCode,
            seatNumber: reservationData.seatNumber,
        });
        return data.id;
    }
    ClientDBUtil.createReservation = createReservation;
    /**
     * Cancels a reservation by its _id.
     *
     * @param reservationID - the reservation _id to cancel
     */
    async function cancelReservation(reservationID) {
        const reservationInfo = await getReservationFromID(reservationID);
        const response = await fetch(`/reservations/${reservationID}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message ?? "Failed to cancel reservation");
        }
        await logActivity({
            user: reservationInfo.user,
            action: "cancelled",
            reservation: reservationID,
            labName: reservationInfo.lab.name,
            seatNumber: reservationInfo.seatNumber,
        });
    }
    ClientDBUtil.cancelReservation = cancelReservation;
    /**
     * Updates an existing reservation.
     *
     * @param reservationID - the reservation _id to update
     * @param data - partial reservation data to update (cannot update _id, user, or lab)
     * @returns the updated ReservationDTO
     */
    async function updateReservation(reservationID, data) {
        const response = await fetch(`/reservations/${reservationID}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });
        const json = await response.json();
        if (!response.ok)
            throw new Error(json.message ?? "Failed to update reservation");
        return json;
    }
    ClientDBUtil.updateReservation = updateReservation;
    /** private helper functions for logging activity */
    async function logActivity(activity) {
        const response = await fetch(`/activity`, {
            method: "POST",
            body: JSON.stringify(activity),
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok)
            throw new Error(`Request failed (${response.status})`);
    }
})(ClientDBUtil || (ClientDBUtil = {}));
//# sourceMappingURL=ClientDbUtil.js.map