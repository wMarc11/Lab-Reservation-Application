const mongoose = require("mongoose");

const LabSchema = mongoose.Schema(
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

module.exports = Lab;