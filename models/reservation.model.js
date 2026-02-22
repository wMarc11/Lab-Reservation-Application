const mongoose = require("mongoose");

const ReservationSchema = mongoose.Schema(
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

module.exports = Reservation;