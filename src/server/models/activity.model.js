import mongoose from 'mongoose';
const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reservation: {
        type: mongoose.Schema.Types.ObjectId,
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
const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
//# sourceMappingURL=activity.model.js.map