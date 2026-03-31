"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const activitySchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reservation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Reservation",
        required: true
    },
    action: {
        type: String,
        enum: ["reserved", "cancelled"],
        required: true
    },
    seatNumber: {
        type: Number,
        required: true
    },
    labName: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});
const Activity = mongoose_1.default.model("Activity", activitySchema);
exports.default = Activity;
//# sourceMappingURL=activity.model.js.map