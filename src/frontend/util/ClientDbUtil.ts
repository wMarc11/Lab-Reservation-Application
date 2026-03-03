import { UserDTO } from "../../server/models/clientTypes";
import { ReservationDTO } from "../../server/models/clientTypes";

export type UserID = string & {_brand: "UserID"}
export type ReservationID = string & {_brand: "ReservationID"}

export namespace ClientDBUtil {
    /**
     * Gets the current logged in user
     * returns to home page if not logged in
     */
    export function getCurrentUserID(): UserID {
        const currentUserID = sessionStorage.getItem("user");
        if (currentUserID === null) {
            window.location.href = "index.html";
            throw new Error("Not logged in");
        }

        return currentUserID as UserID;
    }

    export async function getCurrentUser(userID = getCurrentUserID()): Promise<Omit<UserDTO, "password">> {
        const response = await fetch(`/users/${userID}`);
        return response.json() as Promise<Omit<UserDTO, "password">>;
    }

    export async function getCurrentReservations(userID = getCurrentUserID()): Promise<ReservationDTO[]> {
        const response = await fetch(`/reservations/user/${userID}`);
        return response.json() as Promise<ReservationDTO[]>;
    }

    export async function createReservation(
        labID: string,
        reservationData: Omit<ReservationDTO, "user" | "lab" | "_id">,
        userID = getCurrentUserID(),
    ): Promise<ReservationID> {
        const response = await fetch(`/reservations`, {
            method: "POST",
            body: JSON.stringify({...reservationData, lab: labID, user: userID}),
            headers: {"Content-Type": "application/json"},
        })

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message ?? "Failed to create reservation")
        }

        return data.id;
    }

    export async function cancelReservation(reservationID: string) {
        const response = await fetch(`/reservations/${reservationID}`, {method: "DELETE"});

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message ?? "Failed to cancel reservation");
        }
    }

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
}
