import { LabName } from "./labNames";

export type Activity<TID = string, TDate = string> = {
    user: TID;
    reservation: TID;
    action: "reserved" | "cancelled";
    seatNumber: number;
    labName: string;
    timestamp?: TDate;
}
export type ActivityDTO = Activity & {_id: string};

export type Building<TID = string, TDate = string> = {
    name: string,
    floors: number,
}
export type BuildingDTO = Building & {_id: string};

export type Lab<TID = string> = {
    building: TID,
    floor: number,
    room: LabName,
    name?: string,
    totalSeats?: number
}
export type LabDTO = Lab & {_id: string};

export type Reservation<TID = string, TDate = string> = {
    user: TID;
    lab: TID;
    seatNumbers: number[];
    isAnonymous?: boolean;
    date: TDate;
    dateRequested: TDate;
    startTime: TDate;
    endTime: TDate;
    status?: "upcoming" | "today" | "past" | "cancelled";
}
export type ReservationDTO = Omit<Reservation, "lab"> & { _id: string, lab: { _id: string, room: LabName }, user: { _id: string; firstName: string; lastName: string }};

export type User<TID = string, TDate = string> = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: "Student" | "Lab Technician" | "Admin";
    profileImage?: string;
    description?: string;
    isActive?: boolean;
    studentID?: string;
    course?: string;
    contactNumber?: string;
}
export type UserDTO = User & {_id: string};
