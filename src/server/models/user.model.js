import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
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
        enum: ["Student", "Admin"],
        default: "Student",
        required: true,
    },
    profileImage: {
        type: String,
        default: "default.webp"
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
}, {
    timestamps: true,
});
const User = mongoose.model("User", UserSchema);
export default User;
//# sourceMappingURL=user.model.js.map