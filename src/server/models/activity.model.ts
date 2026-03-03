import mongoose from 'mongoose';

export type Activity = {
    user: mongoose.Types.ObjectId;
    reservation: mongoose.Types.ObjectId;
    action: "reserved" | "cancelled";
    seatNumber: number;
    labName: string;
    timestamp: Date;
}

const activitySchema = new mongoose.Schema<Activity>({
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
