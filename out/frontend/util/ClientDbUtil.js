const BASE_URL = "https://lab-reservation-application-wip.onrender.com";
export var ClientDBUtil;
(function (ClientDBUtil) {
    /**
     * Validates if the user is logged in.
     * Redirects to home page if not
     */
    async function validateSession(sendBackToHomePage = true) {
        const response = await fetch(`/auth/check`, { credentials: 'include' });
        const data = await response.json();
        if (!data.loggedIn && sendBackToHomePage)
            window.location.href = "index.html";
        return data.userID;
    }
    ClientDBUtil.validateSession = validateSession;
    /**
     * Gets the current logged in user's database object (like email, firstName) without password.
     *
     * @param userID - defaults to the currently logged in user
     * @returns the user object without password
     */
    async function getCurrentUser() {
        const response = await fetch(`/users`);
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
    async function getCurrentReservations() {
        const response = await fetch(`/reservations/user`);
        if (!response.ok)
            throw new Error(`Request failed (${response.status})`);
        return response.json();
    }
    ClientDBUtil.getCurrentReservations = getCurrentReservations;
    async function getAllReservations() {
        const res = await fetch(`${BASE_URL}/reservations`);
        if (!res.ok) {
            throw new Error("Failed to fetch all reservations");
        }
        return res.json();
    }
    ClientDBUtil.getAllReservations = getAllReservations;
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
    async function createReservation(labRoomCode, reservationData) {
        const labID = await getLabIDFromLabCode(labRoomCode);
        const response = await fetch(`/reservations`, {
            method: "POST",
            body: JSON.stringify({ ...reservationData, lab: labID }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message ?? "Failed to create reservation");
        }
        return data.id;
    }
    ClientDBUtil.createReservation = createReservation;
    /**
     * Cancels a reservation by its _id.
     *
     * @param reservationID - the reservation _id to cancel
     */
    async function cancelReservation(reservationID) {
        const response = await fetch(`/reservations/${reservationID}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message ?? "Failed to cancel reservation");
        }
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
})(ClientDBUtil || (ClientDBUtil = {}));
//# sourceMappingURL=ClientDbUtil.js.map