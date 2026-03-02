export type Lab = "GK301" | "GK302A" | "GK302B";
export type Status = "UPCOMING" | "TODAY" | "PAST" | "CANCELLED";
export type Reservation = {
    id: string;
    userId: string;
    lab: Lab;
    seat: number;
    dateTimeReq: string | null;
    date: string;
    startTime: string;
    endTime: string;
    anonymous: boolean;
    cancelled: boolean;
}
export type ReservationWithStatus = Reservation & { _status: Status };
