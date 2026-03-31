"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAB_SEAT_CONFIG = exports.BUILDING_LABELS = void 0;
exports.getLabsForBuildingFloor = getLabsForBuildingFloor;
exports.getLabLayout = getLabLayout;
exports.getLabCapacity = getLabCapacity;
exports.normalizeBuildingCode = normalizeBuildingCode;
exports.parseFloorNumber = parseFloorNumber;
const labNames_js_1 = require("./labNames.js");
const DEFAULT_LAB_CAPACITY = 20;
exports.BUILDING_LABELS = {
    GH: "Gokongwei Hall",
    STRC: "Science and Technology Research Center",
    SJ: "St. Joseph Hall",
    LS: "St. La Salle Hall",
    MH: "St. Miguel Hall",
    VH: "Velasco Hall"
};
function inferLabLocation(labName) {
    if (labName.startsWith("GK")) {
        return { buildingCode: "GH", floor: Number(labName[2]) };
    }
    if (labName.startsWith("STRC")) {
        const match = /^STRC(\d)/.exec(labName);
        return { buildingCode: "STRC", floor: Number(match?.[1] ?? 1) };
    }
    if (labName.startsWith("SJ")) {
        const normalized = labName.replace(/\s+/g, "");
        const match = /^(?:SJLAB|SJ)(\d)/.exec(normalized);
        return { buildingCode: "SJ", floor: Number(match?.[1] ?? 2) };
    }
    if (labName.startsWith("LS")) {
        const normalized = labName.replace(/\s+/g, "");
        const match = /^LS(\d)/.exec(normalized);
        return { buildingCode: "LS", floor: Number(match?.[1] ?? 2) };
    }
    if (labName.startsWith("M")) {
        const match = /^M(\d)/.exec(labName);
        return { buildingCode: "MH", floor: Number(match?.[1] ?? 1) };
    }
    if (labName.startsWith("V")) {
        const match = /^V(\d)/.exec(labName);
        return { buildingCode: "VH", floor: Number(match?.[1] ?? 1) };
    }
    return { buildingCode: "GH", floor: 1 };
}
/*
function tables(count: number, orientation: "row" | "column" = "row") {
    return Array.from({ length: count }, () => ({ type: "table", orientation } as const));
} */
function countSeats(layout) {
    return layout.reduce((totalSeats, row) => {
        return totalSeats + row.items.reduce((rowTotal, item) => {
            if (item.type === "seat") {
                return rowTotal + 1;
            }
            if (item.type === "seat-group") {
                return rowTotal + item.seatNumbers.length;
            }
            return rowTotal;
        }, 0);
    }, 0);
}
function createGenericLayout(capacity) {
    const rows = [];
    const seatsPerRow = 5;
    for (let seatNumber = 1; seatNumber <= capacity; seatNumber += seatsPerRow) {
        const rowSeatNumbers = [];
        for (let currentSeat = seatNumber; currentSeat < seatNumber + seatsPerRow && currentSeat <= capacity; currentSeat += 1) {
            rowSeatNumbers.push(currentSeat);
        }
        rows.push({
            className: "row-spread",
            items: [
                {
                    type: "seat-group",
                    seatNumbers: rowSeatNumbers
                }
            ]
        });
    }
    return rows;
}
/*
function createGk301Layout(): LabLayoutRow[] {
    return [
        {
            className: "row-spread",
            items: [...tables(2)]
        },
        {
            className: "row-spread",
            items: [
                { type: "seat-group", seatNumbers: [1, 2, 3] },
                { type: "seat-group", seatNumbers: [4, 5, 6] }
            ]
        },
        {
            className: "row-spread",
            items: [...tables(3)]
        },
        {
            className: "row-spread",
            items: [
                { type: "seat-group", seatNumbers: [7, 8, 9] },
                { type: "seat-group", seatNumbers: [10, 11, 12] },
                { type: "seat-group", seatNumbers: [13, 14, 15] }
            ]
        },
        {
            className: "row-spread",
            items: [...tables(3)]
        },
        {
            className: "row-spread",
            items: [
                { type: "seat-group", seatNumbers: [16, 17, 18] },
                { type: "seat-group", seatNumbers: [19, 20, 21] },
                { type: "seat-group", seatNumbers: [22, 23, 24] }
            ]
        },
        {
            className: "row-spread",
            items: [...tables(3)]
        },
        {
            className: "row-spread",
            items: [
                { type: "seat-group", seatNumbers: [25, 26, 27] },
                { type: "seat-group", seatNumbers: [28, 29, 30] },
                { type: "seat-group", seatNumbers: [31, 32, 33] }
            ]
        }
    ];
}

function createGk302Or306Layout(): LabLayoutRow[] {
    return [
        {
            className: "row-spread",
            items: [
                { type: "seat-group", seatNumbers: [1, 2], orientation: "column", style: "margin-left:17.5rem;" },
                ...tables(2),
                { type: "seat-group", seatNumbers: [3, 4], orientation: "column", style: "margin-right:10.5rem;" },
                { type: "seat-group", seatNumbers: [5, 6], orientation: "column" },
                ...tables(2),
                { type: "seat-group", seatNumbers: [7, 8], orientation: "column" }
            ]
        },
        {
            className: "row-spread",
            items: [
                { type: "seat-group", seatNumbers: [9, 10], orientation: "column", style: "margin-left:17.5rem;" },
                ...tables(2),
                { type: "seat-group", seatNumbers: [11, 12], orientation: "column", style: "margin-right:10.5rem;" },
                { type: "seat-group", seatNumbers: [13, 14], orientation: "column" },
                ...tables(2),
                { type: "seat-group", seatNumbers: [15, 16], orientation: "column" }
            ]
        },
        {
            className: "row-spread",
            items: [
                { type: "table" },
                { type: "seat", seatNumber: 17 },
                { type: "seat-group", seatNumbers: [18, 19], orientation: "column", style: "margin-left:9rem;" },
                ...tables(2),
                { type: "seat-group", seatNumbers: [20, 21], orientation: "column", style: "margin-right:10.5rem;" },
                { type: "seat-group", seatNumbers: [22, 23], orientation: "column" },
                ...tables(2),
                { type: "seat-group", seatNumbers: [24, 25], orientation: "column" }
            ]
        },
        {
            className: "row-spread",
            items: [
                { type: "table" },
                { type: "seat-group", seatNumbers: [26], orientation: "column", style: "margin-left:51.4rem; margin-top:-1rem;" }
            ]
        }
    ];
}
    */
const CUSTOM_LAYOUTS = { /*
    GK301: createGk301Layout(),
    GK302A: createGk302Or306Layout(),
    GK306A: createGk302Or306Layout()*/};
exports.LAB_SEAT_CONFIG = labNames_js_1.LAB_NAMES.reduce((config, labName) => {
    const location = inferLabLocation(labName);
    const customLayout = CUSTOM_LAYOUTS[labName];
    const layout = customLayout ?? createGenericLayout(DEFAULT_LAB_CAPACITY);
    config[labName] = {
        capacity: customLayout ? countSeats(customLayout) : DEFAULT_LAB_CAPACITY,
        buildingCode: location.buildingCode,
        floor: location.floor,
        layout
    };
    return config;
}, {});
function getLabsForBuildingFloor(buildingCode, floor) {
    return labNames_js_1.LAB_NAMES.filter((labName) => {
        const config = exports.LAB_SEAT_CONFIG[labName];
        return config.buildingCode === buildingCode && config.floor === floor;
    });
}
function getLabLayout(room) {
    return exports.LAB_SEAT_CONFIG[room]?.layout ?? createGenericLayout(DEFAULT_LAB_CAPACITY);
}
function getLabCapacity(room) {
    return exports.LAB_SEAT_CONFIG[room]?.capacity ?? DEFAULT_LAB_CAPACITY;
}
function normalizeBuildingCode(value) {
    if (!value) {
        return null;
    }
    const normalized = value.trim().toUpperCase();
    if (normalized === "GH" || normalized === "GOKS" || normalized === "GOKONGWEI HALL") {
        return "GH";
    }
    if (normalized === "STRC" || normalized === "SCIENCE AND TECHNOLOGY RESEARCH CENTER") {
        return "STRC";
    }
    if (normalized === "SJ" || normalized === "ST. JOSEPH HALL") {
        return "SJ";
    }
    if (normalized === "LS" || normalized === "ST. LA SALLE HALL") {
        return "LS";
    }
    if (normalized === "MH" || normalized === "ST. MIGUEL HALL") {
        return "MH";
    }
    if (normalized === "VH" || normalized === "VELASCO HALL") {
        return "VH";
    }
    return null;
}
function parseFloorNumber(value) {
    if (typeof value === "number" && Number.isInteger(value) && value > 0) {
        return value;
    }
    if (typeof value !== "string") {
        return null;
    }
    const match = /(\d+)/.exec(value);
    if (!match) {
        return null;
    }
    const parsedFloor = Number(match[1]);
    return Number.isInteger(parsedFloor) && parsedFloor > 0 ? parsedFloor : null;
}
//# sourceMappingURL=labSeatConfig.js.map