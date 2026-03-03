import mongoose from "mongoose";

export type Reservation = {
    user: mongoose.Types.ObjectId;
    lab: mongoose.Types.ObjectId;
    seatNumber: number;
    date: Date;
    dateRequested: Date;
    startTime: Date;
    endTime: Date;
    status?: "upcoming" | "today" | "past" | "cancelled";  
}

const ReservationSchema = new mongoose.Schema<Reservation>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        lab: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lab",
            required: true
        },

        seatNumber: {
            type: Number,
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        dateRequested: {
            type: Date,
            required: true
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["upcoming", "today", "past", "cancelled"],
            default: "upcoming"
        }
    },
    {
        timestamps: true
    }
);

ReservationSchema.index(
    {
        lab: 1,
        date: 1,
        seatNumber: 1,
        startTime: 1,
        endTime: 1,
    },
    {
        unique: true
    }
)

const Reservation = mongoose.model("Reservation", ReservationSchema);
export default Reservation;
