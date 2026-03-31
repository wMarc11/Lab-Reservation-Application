"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ReservationSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    lab: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
const Reservation = mongoose_1.default.model("Reservation", ReservationSchema);
exports.default = Reservation;
//# sourceMappingURL=reservation.model.js.map