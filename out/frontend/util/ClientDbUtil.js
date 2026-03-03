export var ClientDBUtil;
(function (ClientDBUtil) {
    /**
     * Gets the current logged in user
     * returns to home page if not logged in
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
    async function getCurrentUser(userID = getCurrentUserID()) {
        const response = await fetch(`/users/${userID}`);
        return response.json();
    }
    ClientDBUtil.getCurrentUser = getCurrentUser;
    async function getCurrentReservations(userID = getCurrentUserID()) {
        const response = await fetch(`/reservations/user/${userID}`);
        return response.json();
    }
    ClientDBUtil.getCurrentReservations = getCurrentReservations;
    async function createReservation(labID, reservationData, userID = getCurrentUserID()) {
        const response = await fetch(`/reservations`, {
            method: "POST",
            body: JSON.stringify({ ...reservationData, lab: labID, user: userID }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message ?? "Failed to create reservation");
        }
        return data.id;
    }
    ClientDBUtil.createReservation = createReservation;
    async function cancelReservation(reservationID) {
        const response = await fetch(`/reservations/${reservationID}`, { method: "DELETE" });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message ?? "Failed to cancel reservation");
        }
    }
    ClientDBUtil.cancelReservation = cancelReservation;
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