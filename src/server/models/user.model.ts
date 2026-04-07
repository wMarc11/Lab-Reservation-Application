import mongoose from "mongoose";
import { User } from "../../shared/modelTypes";

type UserDB = User<mongoose.Types.ObjectId, Date>

const UserSchema = new mongoose.Schema<UserDB>(
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
            enum: ["Student", "Lab Technician", "Admin"],
            default: "Student",
            required: true,
        },

        profileImage: {
            type: String,
            default: "default.webp"
        },

        description: {
            type: String,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: true
        },

        studentID: {
            type: String,
            default: ""
        },

        course: {
            type: String,
            default: ""
        },

        contactNumber: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", UserSchema);
export default User;
