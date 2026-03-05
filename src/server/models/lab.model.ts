import mongoose from "mongoose";
import { Lab } from "../../shared/modelTypes";
import { LAB_NAMES } from "../../shared/labNames";

export type LabDB = Lab<mongoose.Types.ObjectId> 

const LabSchema = new mongoose.Schema<LabDB>(
    {
        building: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Building",
            required: true
        },

        floor: {
            type: Number,
            required: true
        },

        room: {
            type: String,
            enum: LAB_NAMES,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Lab = mongoose.model("Lab", LabSchema);
export default Lab;
