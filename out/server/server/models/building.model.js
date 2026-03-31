"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BuildingSchema = new mongoose_1.default.Schema({
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
const Building = mongoose_1.default.model("Building", BuildingSchema);
exports.default = Building;
//# sourceMappingURL=building.model.js.map