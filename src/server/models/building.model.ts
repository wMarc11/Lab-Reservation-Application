import mongoose from "mongoose";

export type Building = {
    name: string,
    floors: number,
}

const BuildingSchema = new mongoose.Schema<Building>(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        floors: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true
    }
);

const Building = mongoose.model("Building", BuildingSchema);
export default Building;
