export interface Account {
    id: number,
    user?: string,
    email: string,
    phoneNumber?: string,
    password: string,
    accountType: "Student" | "Admin",
    reservations: Reservation[]
    course?: string,
}

export interface Reservation {
    id: string,
    labratory: Labratory,
    dateTimeRequested: DateTime,
    dateTimeSchedule: DateTime,
    time: Time,
    seat: number,
    visibility: "Public" | "Anonymous",
    status: "Today" | "Upcoming" | "Past",
}

export type Labratory = "GK302B" | "GK301" | "GK302A";

export interface DateTime {
    year: number,
    month: number,
    day: number,
    time: Time,
}

export interface Time {
    hour: number,
    minute: number,
}

export interface ModalFields {
    email: string,
    password: string,
    rememberMe: boolean,
}
