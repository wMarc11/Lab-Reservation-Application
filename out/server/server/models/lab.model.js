"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const labNames_1 = require("../../shared/labNames");
const labSeatConfig_1 = require("../../shared/labSeatConfig");
const LabSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true,
        default: undefined
    },
    building: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Building",
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    room: {
        type: String,
        enum: labNames_1.LAB_NAMES,
        required: true
    },
    totalSeats: {
        type: Number,
        required: true,
        default: function () {
            return (0, labSeatConfig_1.getLabCapacity)(this.room);
        }
    }
}, {
    timestamps: true
});
LabSchema.pre("validate", function () {
    if (!this.name && this.room) {
        this.name = this.room;
    }
    if (!this.totalSeats && this.room) {
        this.totalSeats = (0, labSeatConfig_1.getLabCapacity)(this.room);
    }
});
LabSchema.index({ name: 1 }, { unique: true, sparse: true });
LabSchema.index({ room: 1 }, { unique: true });
LabSchema.index({ building: 1, floor: 1, room: 1 }, { unique: true });
const Lab = mongoose_1.default.model("Lab", LabSchema);
exports.default = Lab;
//# sourceMappingURL=lab.model.js.map