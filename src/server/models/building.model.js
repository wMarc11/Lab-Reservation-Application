import mongoose from "mongoose";
const BuildingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    floors: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});
const Building = mongoose.model("Building", BuildingSchema);
export default Building;
//# sourceMappingURL=building.model.js.map