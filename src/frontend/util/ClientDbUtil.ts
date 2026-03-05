import { LabName } from "../../shared/labNames";
import { ActivityDTO, LabDTO, UserDTO } from "../../shared/modelTypes";
import { ReservationDTO } from "../../shared/modelTypes";

export type UserID = string & {_brand: "UserID"}
export type ReservationID = string & {_brand: "ReservationID"}

export namespace ClientDBUtil {
    /**
     * Gets the current logged in user ID from sessionStorage.
     * Redirects to home page if not logged in.
     */
    export function getCurrentUserID(): UserID {
        const currentUserID = sessionStorage.getItem("user");
        if (currentUserID === null) {
            window.location.href = "index.html";
            throw new Error("Not logged in");
        }
        return currentUserID as UserID;
    }

    /**
     * Gets the current logged in user's database object (like email, firstName) without password.
     *
     * @param userID - defaults to the currently logged in user
     * @returns the user object without password
     */
    export async function getCurrentUser(userID = getCurrentUserID()): Promise<Omit<UserDTO, "password">> {
        const response = await fetch(`/users/${userID}`);
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json() as Promise<Omit<UserDTO, "password">>;
    }

    /**
     * Gets the lab database object by its MongoDB _id.
     *
     * @param labID - the lab database _id
     * @returns the full lab object (LabDTO)
     */
    export async function getLabObjectFromID(labID: string): Promise<LabDTO> {
        const response = await fetch(`/lab/id/${labID}`);
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json() as Promise<LabDTO>;
    }

    /**
     * Gets the lab database object by its room code.
     *
     * @param labRoomCode - e.g., "GK201", "LS103"
     * @returns the full lab object (LabDTO)
     */
    export async function getLabObjectFromLabCode(labRoomCode: LabName): Promise<LabDTO> {
        const response = await fetch(`/lab/name/${labRoomCode}`);
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json() as Promise<LabDTO>;
    }

    /**
     * Gets the lab's database _id from its room code.
     *
     * @param labRoomCode - e.g., "GK201", "LS103"
     * @returns the lab's _id as a string
     */
    export async function getLabIDFromLabCode(labRoomCode: LabName): Promise<string> {
        const labObject = await getLabObjectFromLabCode(labRoomCode);
        return labObject._id; //this can be done more effecient with a seperate GET, unfortunately im too lazy
    }

    /**
     * Gets all reservations for the current user.
     *
     * @param userID - defaults to the currently logged in user
     * @returns an array of ReservationDTO objects
     */
    export async function getCurrentReservations(userID = getCurrentUserID()): Promise<ReservationDTO[]> {
        const response = await fetch(`/reservations/user/${userID}`);
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json() as Promise<ReservationDTO[]>;
    }

    /**
     * Gets reservation from id
     *
     * @param reservationID
     * @returns ReservationDTO objects
     */
    export async function getReservationFromID(reservationID: string): Promise<ReservationDTO> {
        const response = await fetch(`/reservations/id/${reservationID}`);
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json() as Promise<ReservationDTO>;
    }

    /**
     * Creates a new reservation for a lab.
     *
     * @param labRoomCode - room code of the lab (e.g., "GK201")
     * @param reservationData - reservation details without user, lab, or _id
     * @param userID - defaults to the currently logged in user
     * @returns the created reservation's _id
     */
    export async function createReservation(
        labRoomCode: LabName,
        reservationData: Omit<ReservationDTO, "user" | "lab" | "_id">,
        userID = getCurrentUserID(),
    ): Promise<ReservationID> {
        const labID = await getLabIDFromLabCode(labRoomCode);
        const response = await fetch(`/reservations`, {
            method: "POST",
            body: JSON.stringify({...reservationData, lab: labID, user: userID}),
            headers: {"Content-Type": "application/json"},
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message ?? "Failed to create reservation");
        }

        for (const seatNumber of reservationData.seatNumbers) {
            await logActivity({
                user: userID,
                action: "reserved",
                reservation: data.id,
                labName: labRoomCode,
                seatNumber
            });
        }

        return data.id;
    }

    /**
     * Cancels a reservation by its _id.
     *
     * @param reservationID - the reservation _id to cancel
     */
    export async function cancelReservation(reservationID: string) {
        const reservationInfo = await getReservationFromID(reservationID);
        const response = await fetch(`/reservations/${reservationID}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message ?? "Failed to cancel reservation");
        }
        for (const seatNumber of reservationInfo.seatNumbers) {
            await logActivity({
                user: reservationInfo.user,
                action: "cancelled",
                reservation: reservationID,
                labName: reservationInfo.lab.room,
                seatNumber
            });
        }
    }

    /**
     * Updates an existing reservation.
     *
     * @param reservationID - the reservation _id to update
     * @param data - partial reservation data to update (cannot update _id, user, or lab)
     * @returns the updated ReservationDTO
     */
    export async function updateReservation(
        reservationID: string,
        data: Partial<Omit<ReservationDTO, "_id" | "user" | "lab">>
    ): Promise<ReservationDTO> {
        const response = await fetch(`/reservations/${reservationID}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const json = await response.json();
        if (!response.ok) throw new Error(json.message ?? "Failed to update reservation");
        return json;
    }

    /** private helper functions for logging activity */
    async function logActivity(activity: Omit<ActivityDTO, "_id">) {
        const response = await fetch(`/activity`, {
            method: "POST",
            body: JSON.stringify(activity),
            headers: {"Content-Type": "application/json"},
        });

        if (!response.ok)
            throw new Error(`Request failed (${response.status})`)
    }
}
