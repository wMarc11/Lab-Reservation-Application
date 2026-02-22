const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },

        lastName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
            required: true,
        },

        profileImage: {
            type: String,
            default: "default.png"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;