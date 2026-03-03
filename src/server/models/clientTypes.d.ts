import mongoose from "mongoose";
import { Reservation } from "./reservation.model";
import { Activity } from "./activity.model";
import { User } from "./user.model";
import { Lab } from "./lab.model";
import { Building } from "./building.model";

type toJSON<T> = {
    [K in keyof T]: T[K] extends mongoose.Types.ObjectId ? string :
        T[K] extends Date ? string :
        T[K];
} & { _id: string };

//USE THESE ON THE CLIENT
export type ReservationDTO = toJSON<Reservation>
export type ActivityDTO = toJSON<Activity>
export type UserDTO = toJSON<User>
export type LabDTO = toJSON<Lab>
export type BuildingDTO = toJSON<Building>


