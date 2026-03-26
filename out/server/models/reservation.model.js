import mongoose from "mongoose";
const ReservationSchema = new mongoose.Schema({
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
    seatNumbers: {
        type: [Number],
        required: true,
        validate: [
            {
                validator: (value) => Array.isArray(value) && value.length > 0,
                message: "At least one seat must be selected"
            },
            {
                validator: (value) => value.every((seat) => Number.isInteger(seat) && seat > 0),
                message: "Seat numbers must be positive whole numbers"
            },
            {
                validator: (value) => new Set(value).size === value.length,
                message: "Seat numbers must be unique within one reservation"
            }
        ]
    },
    isAnonymous: {
        type: Boolean,
        default: false
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
}, {
    timestamps: true
});
ReservationSchema.index({
    lab: 1,
    date: 1,
    startTime: 1,
    endTime: 1,
    status: 1
});
ReservationSchema.index({
    user: 1,
    date: 1,
    startTime: 1
});
const Reservation = mongoose.model("Reservation", ReservationSchema);
export default Reservation;
//# sourceMappingURL=reservation.model.js.map