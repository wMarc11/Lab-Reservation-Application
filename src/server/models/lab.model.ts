import mongoose from "mongoose";

export type Lab = {
    name: string,
    building: mongoose.Schema.Types.ObjectId,
    floor: number,
    totalSeats: number,
    location?: string,
    layout: {
        type: "seat" | "table";
        xCoord: number;
        yCoord: number;
        width?: number;
        height?: number;
        status?: "available" | "reserved" | "unavailable";
        reservedBy?: mongoose.Types.ObjectId | null;
    }[],
    isActive?: boolean;
}

const LabSchema = new mongoose.Schema<Lab>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },

        building: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Building",
            required: true
        },

        floor: {
            type: Number,
            required: true
        },

        totalSeats: {
            type: Number,
            required: true
        },

        location: {
            type: String
        },

        layout: [
            {
                type: {
                    type: String,
                    enum: ["seat", "table"],
                    required: true
                },

                xCoord: {
                    type: Number,
                    required: true
                },

                yCoord: {
                    type: Number,
                    required: true,  
                },

                width: Number,

                height: Number,

                status: {
                    type: String,
                    enum: ["available", "reserved", "unavailable"],
                    default: "available"
                },

                reservedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    default: null
                }
            }
        ],
        
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Lab = mongoose.model("Lab", LabSchema);
export default Lab;
