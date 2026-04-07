import mongoose from 'mongoose';
import { Activity } from '../../shared/modelTypes';

type ActivityDB = Activity<mongoose.Types.ObjectId, Date>;

const activitySchema = new mongoose.Schema<ActivityDB>({
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
        enum: ["reserved", "cancelled", "admin-cancelled"],
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
