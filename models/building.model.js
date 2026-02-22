const mongoose = require("mongoose");

const BuildingSchema = mongoose.Schema(
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

module.exports = Building;