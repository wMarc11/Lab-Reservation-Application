import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';

import User from './models/user.model';
import Reservation from './models/reservation.model';
import Lab from './models/lab.model';
import { ActivityDTO } from '../shared/modelTypes';
import Activity from './models/activity.model';
import Building from './models/building.model';
import { request } from 'http';
import { promisify } from 'util';

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const session = require('express-session')
app.use(express.static(path.join(process.cwd())));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.post("/signup", async (request: any, response: any) => {
    const {email, password, role} = request.body;
    if (!email.includes("_") || !email.includes("@") || !email.endsWith("@dlsu.edu.ph")) {
        response.status(400).json({ message: "Invalid email format!" });
        return;
    }

    try {
        const defaultUsername= email.split("@")[0];
        const defaultFirstName = capitalizeFirstLetter(defaultUsername.split("_")[0]);
        const defaultLastName = capitalizeFirstLetter(defaultUsername.split("_")[1]);
        const newUser = new User({
            firstName: defaultFirstName,
            lastName: defaultLastName,
            email,
            role,
            password,
        })
        await newUser.save()

        request.session.userID = newUser.id;

        return response.status(201).json({ message: "User created!", user: newUser._id});
    } catch (errorRecieved) {
        const error = errorRecieved as any;
        if (error.code === 11000) //11000 is code for attempting to add an existing document field with a unique key
           return response.status(400).json({message: "Account with email already exists!"})

        return response.status(400).json({ message: error.message});
    }
})


app.post("/login", async (request: any, response: any) => {
    const {email, password} = request.body;
    try {
        const user = await User.findOne({email})
        if (!user) {
            return response.status(400).json({message: "User with email doesn't exist!"})
        }

        if (user.password !== password) {
            return response.status(400).json({message: "Invalid Password!"})
        }

        request.session.userID = user.id;

        return response.status(201).json({ message: "User found!", user: user._id});
    } catch (errorRecieved) {
        const error = errorRecieved as any;

        if (error.code === 11000) //11000 is code for attempting to add an existing document field with a unique key
            return response.status(400).json({message: "Account with email already exists!"})

        return response.status(404).json({ message: error.message });
    }
})

app.post('/logout', async (req: any, res) => {
    try {
        const destroySession = promisify(req.session.destroy.bind(req.session));
        await destroySession();
        res.clearCookie('connect.sid', { path: '/' });
    }
    catch (error) {
        res.status(400).json({message: (error as any).message})
    }
})

//ACTIVITY
app.post(`/activity`, async (request, response) => {
    try {
        const info = request.body as Omit<ActivityDTO, "_id">;
        const newActivity = new Activity(info);

        await newActivity.save();
        return response.status(201).json({message: `Activity created`, id: newActivity.id})
    } catch (error) {
        return response.status(400).json({message: (error as any).message})
    }
});

//LAB
app.get(`/lab/name/:name`, async (request, response) => {
    try {
        const lab = await Lab.findOne({room: request.params.name});

        if(!lab){
            return response.status(404).json({message: "Lab not found"});
        }

        return response.json(lab);
    } catch (error) {
        return response.status(400).json({message: (error as any).message});
    }
})

app.get(`/lab/id/:id`, async (request, response) => {
    try {
        const lab = await Lab.findById(request.params.id);

        if (!lab) {
            return response.status(404).json({ message: "Lab not found" });
        }

        return response.json(lab);
    } catch (error) {
        return response.status(400).json({ message: (error as any).message });
    }
})

//RESERVATIONS

app.post(`/reservations`, async (request: any, response) => {
    try {
        const newReservation = await createReservationFromPayload(request.body, request.session?.userID);

        return response.status(201).json({
            message: `Reservation created`,
            id: newReservation.id,
            reservation: serializeReservation(newReservation)
        });
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
})

app.delete("/reservations/:id", async (request, response) => {
    try {
        const reservation = await Reservation.findById(request.params.id).populate("lab", "room");

        if (!reservation) {
            return response.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.status !== "cancelled") {
            reservation.status = "cancelled";
            await reservation.save();
        }

        return response.json({
            message: "Reservation cancelled",
            reservation: serializeReservation(reservation)
        });
    } catch (error) {
        return response.status(400).json({ message: (error as any).message });
    }
});

app.get("/reservations/id/:id", async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate("lab", "room");

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        return res.json(serializeReservation(reservation));
    } catch (error) {
        return res.status(500).json({ message: (error as any).message });
    }
});

// FOR DASHBOARD
app.get("/users/:id", async (req, res) => {
    try{
        const user = await User.findById(req.params.id).select("-password");
        
        if(!user){
            return res.status(400).json({message: "User not found"});
        }

        return res.json(user);
    } catch(error){
        return res.status(400).json({message: (error as any).message});
    }
});

app.put("/reservations/:id", async (request, response) => {
    try {
        const existingReservation = await Reservation.findById(request.params.id);

        if (!existingReservation) {
            return response.status(404).json({ message: "Reservation not found" });
        }

        const nextLab = await resolveLabFromPayload({
            ...request.body,
            lab: request.body.lab ?? existingReservation.lab.toString()
        });

        const nextSeatNumbers =
            request.body.seatNumbers === undefined && request.body.seatNumber === undefined
                ? existingReservation.seatNumbers
                : normalizeSeatNumbers(request.body);

        const nextDate = request.body.date === undefined
            ? parseDateOnly(existingReservation.date)
            : parseDateOnly(request.body.date);

        const nextStartTime = request.body.startTime === undefined
            ? new Date(existingReservation.startTime)
            : combineDateAndTime(nextDate, request.body.startTime);

        const nextEndTime = request.body.endTime === undefined
            ? new Date(existingReservation.endTime)
            : combineDateAndTime(nextDate, request.body.endTime);

        ensureThirtyMinuteSlotRange(nextStartTime, nextEndTime);

        const conflictingReservations = await findConflictingReservations(
            nextLab.id,
            nextSeatNumbers,
            nextDate,
            nextStartTime,
            nextEndTime,
            request.params.id
        );

        const conflictingSeatNumbers = extractConflictingSeatNumbers(conflictingReservations, nextSeatNumbers);

        if (conflictingSeatNumbers.length > 0) {
            return response.status(409).json({
                message: "One or more selected seats are already reserved for the selected time slot",
                conflictingSeatNumbers
            });
        }

        existingReservation.lab = nextLab._id;
        existingReservation.seatNumbers = nextSeatNumbers;
        existingReservation.isAnonymous = Boolean(request.body.isAnonymous ?? existingReservation.isAnonymous ?? false);
        existingReservation.date = nextDate;
        existingReservation.startTime = nextStartTime;
        existingReservation.endTime = nextEndTime;

        if (request.body.dateRequested !== undefined) {
            existingReservation.dateRequested = parseFlexibleDate(request.body.dateRequested, "dateRequested");
        }

        if (request.body.status !== undefined) {
            existingReservation.status = request.body.status;
        }

        await existingReservation.save();
        await existingReservation.populate("lab", "room");

        return response.json(serializeReservation(existingReservation));
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
});

app.get("/reservations/user/:id", async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.params.id })
            .populate("lab", "room")
            .sort({ date: 1, startTime: 1 });

        return res.json(reservations.map(serializeReservation));
    } catch (error) {
        return res.status(400).json({ message: (error as any).message });
    }
});

app.get("/reservations/occupied", async (request, response) => {
    try {
        const room = typeof request.query.room === "string" ? request.query.room : undefined;
        const date = typeof request.query.date === "string" ? request.query.date : undefined;
        const startTime = typeof request.query.startTime === "string" ? request.query.startTime : undefined;
        const endTime = typeof request.query.endTime === "string" ? request.query.endTime : undefined;

        if (!room || !date) {
            return response.status(400).json({ message: "room and date are required" });
        }

        if ((startTime && !endTime) || (!startTime && endTime)) {
            return response.status(400).json({
                message: "startTime and endTime must be provided together"
            });
        }

        const lab = await Lab.findOne({ room });

        if (!lab) {
            return response.json([]);
        }

        const dayRange = getDayRange(date);
        const query: any = {
            lab: lab._id,
            status: { $ne: "cancelled" },
            date: { $gte: dayRange.start, $lt: dayRange.end }
        };

        if (startTime && endTime) {
            const startDateTime = combineDateAndTime(date, startTime);
            const endDateTime = combineDateAndTime(date, endTime);

            ensureThirtyMinuteSlotRange(startDateTime, endDateTime);

            query.startTime = { $lt: endDateTime };
            query.endTime = { $gt: startDateTime };
        }

        const reservations = await Reservation.find(query)
            .populate("lab", "room")
            .populate("user", "firstName lastName")
            .sort({ startTime: 1 });

        const occupiedSeats = reservations
            .flatMap((reservation: any) => {
                const seatNumbers = Array.isArray(reservation.seatNumbers) ? reservation.seatNumbers : [];

                return seatNumbers.map((seatNumber: number) => ({
                    reservationId: reservation._id,
                    seatNumber,
                    date: reservation.date,
                    startTime: reservation.startTime,
                    endTime: reservation.endTime,
                    room: reservation.lab?.room,
                    isAnonymous: Boolean(reservation.isAnonymous),
                    user: reservation.isAnonymous
                        ? null
                        : reservation.user
                            ? {
                                _id: reservation.user._id,
                                firstName: reservation.user.firstName,
                                lastName: reservation.user.lastName
                            }
                            : null
                }));
            })
            .sort((a, b) =>
                a.seatNumber - b.seatNumber ||
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );

        return response.json(occupiedSeats);
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
});

app.get("/activities/user/:id", async (req, res) =>{
    try{
        const activities = await Activity.find({user: req.params.id})
            .sort({timestamp: -1})

        res.json(activities);
    } catch(error){
        res.status(500).json({message: (error as any).message});
    }
});

    // Temporary route for activity log posting (This will be implemented correctly once reservation api is done)
app.post("/activities/test", async (req, res) => {
    try {
        const activity = await Activity.create({
            user: req.body.userId,
            reservation: new mongoose.Types.ObjectId(),
            action: req.body.action,
            seatNumber: req.body.seatNumber,
            labName: req.body.labName
        });

        res.status(201).json(activity);
    } catch(error){
        res.status(500).json({message: (error as any).message});
    }
});

// PROFILE HANDLING
const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, 'images/');
  },
  filename: function (_, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use('/images', express.static(path.join(__dirname, 'images')));

app.put('/users/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.profileImage = req.file.filename; 
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after' });
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});
    
// DASHBOARD-ADMIN
app.get("/reservations", async (_, res) => {
    try {
        const reservations = await Reservation.find()
            .populate("lab", "room")
            .populate("user", "firstName lastName")
            .sort({ date: 1, startTime: 1 });

        return res.json(reservations.map(serializeReservation));
    } catch (error) {
        return res.status(400).json({ message: (error as any).message });
    }
});

app.get("/activities", async(_req, res) =>{
    try {
        const activities = await Activity.find()
            .populate("user", "firstName lastName")
        res.json(activities);
    } catch (error) {
        res.status(400).json({ message: (error as any).message });
    }
});
    
mongoose.connect("mongodb+srv://marc:marcdb@labreservation.8crxdrf.mongodb.net/?appName=LabReservation")
.then(() =>{
    console.log("Connected to database!");
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
})
.catch((err) =>{
    console.error("Connection failed:", err.message);
});


function capitalizeFirstLetter(string: string) {
  if (!string || string.length === 0) { 
    return "";
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getErrorStatus(error: unknown) {
    return typeof error === "object"
        && error !== null
        && "status" in error
        && typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;
}

function createHttpError(status: number, message: string) {
    const error = new Error(message) as Error & { status: number };
    error.status = status;
    return error;
}

function parseFlexibleDate(value: string | Date, fieldName: string) {
    const parsedDate = value instanceof Date ? new Date(value) : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw createHttpError(400, `Invalid ${fieldName}`);
    }

    return parsedDate;
}

function parseDateOnly(value: string | Date) {
    if (value instanceof Date) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const month = Number(dateOnlyMatch[2]) - 1;
        const day = Number(dateOnlyMatch[3]);
        return new Date(year, month, day);
    }

    const parsedDate = parseFlexibleDate(value, "date");
    return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
}

function combineDateAndTime(dateValue: string | Date, timeValue: string | Date) {
    if (timeValue instanceof Date) {
        return new Date(timeValue);
    }

    if (typeof timeValue === "string" && timeValue.includes("T")) {
        return parseFlexibleDate(timeValue, "time");
    }

    const baseDate = parseDateOnly(dateValue);
    const twelveHourMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeValue);
    const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(timeValue);

    let hours: number;
    let minutes: number;

    if (twelveHourMatch) {
        hours = Number(twelveHourMatch[1]) % 12;
        minutes = Number(twelveHourMatch[2]);

        if (twelveHourMatch[3] && twelveHourMatch[3].toUpperCase() === "PM") {
            hours += 12;
        }
    } else if (twentyFourHourMatch) {
        hours = Number(twentyFourHourMatch[1]);
        minutes = Number(twentyFourHourMatch[2]);
    } else {
        throw createHttpError(400, "Invalid time format");
    }

    return new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        hours,
        minutes,
        0,
        0
    );
}

function getDayRange(value: string | Date) {
    const start = parseDateOnly(value);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
}

async function resolveBuildingFromPayload(payload: any) {
    const rawBuilding = payload.building;
    const floor = Number(payload.floor);

    if (rawBuilding && typeof rawBuilding === "object" && mongoose.isValidObjectId(rawBuilding._id)) {
        const existingBuilding = await Building.findById(String(rawBuilding._id));

        if (!existingBuilding) {
            throw createHttpError(404, "Building not found");
        }

        if (Number.isInteger(floor) && floor > existingBuilding.floors) {
            existingBuilding.floors = floor;
            await existingBuilding.save();
        }

        return existingBuilding;
    }

    if (typeof rawBuilding === "string" && mongoose.isValidObjectId(rawBuilding)) {
        const existingBuilding = await Building.findById(rawBuilding);

        if (!existingBuilding) {
            throw createHttpError(404, "Building not found");
        }

        if (Number.isInteger(floor) && floor > existingBuilding.floors) {
            existingBuilding.floors = floor;
            await existingBuilding.save();
        }

        return existingBuilding;
    }

    if (typeof rawBuilding !== "string" || rawBuilding.trim().length === 0) {
        throw createHttpError(400, "Missing building for reservation");
    }

    const buildingName = rawBuilding.trim();

    let existingBuilding = await Building.findOne({ name: buildingName });

    if (!existingBuilding) {
        existingBuilding = await Building.create({
            name: buildingName,
            floors: Number.isInteger(floor) && floor > 0 ? floor : 1
        });
    } else if (Number.isInteger(floor) && floor > existingBuilding.floors) {
        existingBuilding.floors = floor;
        await existingBuilding.save();
    }

    return existingBuilding;
}

async function resolveLabFromPayload(payload: any) {
    let labId: string | undefined;

    if (typeof payload.lab === "string" && mongoose.isValidObjectId(payload.lab)) {
        labId = payload.lab;
    } else if (payload.lab && typeof payload.lab === "object" && mongoose.isValidObjectId(payload.lab._id)) {
        labId = String(payload.lab._id);
    }

    if (labId) {
        const existingLab = await Lab.findById(labId);

        if (!existingLab) {
            throw createHttpError(404, "Lab not found");
        }

        return existingLab;
    }

    const floor = Number(payload.floor);
    const room = payload.room;

    if (!room || !Number.isInteger(floor)) {
        throw createHttpError(400, "Missing floor or room for reservation");
    }

    const buildingDoc = await resolveBuildingFromPayload(payload);

    let existingLab = await Lab.findOne({
        building: buildingDoc._id,
        floor,
        room
    });

    if (!existingLab) {
        existingLab = await Lab.create({
            building: buildingDoc._id,
            floor,
            room
        });
    }

    return existingLab;
}

function normalizeSeatNumbers(payload: any) {
    const rawSeatNumbers = payload.seatNumbers ?? payload.seatNumber;

    if (rawSeatNumbers === undefined || rawSeatNumbers === null || rawSeatNumbers === "") {
        throw createHttpError(400, "At least one seat must be selected");
    }

    const candidateSeatValues = Array.isArray(rawSeatNumbers)
        ? rawSeatNumbers
        : typeof rawSeatNumbers === "string" && rawSeatNumbers.includes(",")
            ? rawSeatNumbers.split(",")
            : [rawSeatNumbers];

    const parsedSeatNumbers = candidateSeatValues.map((seat) => Number(String(seat).trim()));

    if (parsedSeatNumbers.length === 0) {
        throw createHttpError(400, "At least one seat must be selected");
    }

    if (parsedSeatNumbers.some((seat) => !Number.isInteger(seat) || seat <= 0)) {
        throw createHttpError(400, "Seat numbers must be positive whole numbers");
    }

    const uniqueSeatNumbers = [...new Set(parsedSeatNumbers)].sort((a, b) => a - b);

    if (uniqueSeatNumbers.length !== parsedSeatNumbers.length) {
        throw createHttpError(400, "Seat numbers must not contain duplicates");
    }

    return uniqueSeatNumbers;
}

function ensureThirtyMinuteSlotRange(startTime: Date, endTime: Date) {
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;

    if (durationMinutes <= 0) {
        throw createHttpError(400, "End time must be after start time");
    }

    if (durationMinutes % 30 !== 0) {
        throw createHttpError(400, "Reservations must use 30-minute slot intervals");
    }
}

async function findConflictingReservations(
    labId: string,
    seatNumbers: number[],
    dateValue: string | Date,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: string
) {
    const dayRange = getDayRange(dateValue);
    const query: any = {
        lab: labId,
        status: { $ne: "cancelled" },
        date: { $gte: dayRange.start, $lt: dayRange.end },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        seatNumbers: { $in: seatNumbers }
    };

    if (excludeReservationId) {
        query._id = { $ne: excludeReservationId };
    }

    return Reservation.find(query);
}

function extractConflictingSeatNumbers(existingReservations: any[], requestedSeatNumbers: number[]) {
    const requestedSeatSet = new Set(requestedSeatNumbers);
    const conflictingSeatSet = new Set<number>();

    for (const reservation of existingReservations) {
        const seatNumbers = Array.isArray(reservation.seatNumbers) ? reservation.seatNumbers : [];

        for (const seatNumber of seatNumbers) {
            const parsedSeatNumber = Number(seatNumber);

            if (requestedSeatSet.has(parsedSeatNumber)) {
                conflictingSeatSet.add(parsedSeatNumber);
            }
        }
    }

    return [...conflictingSeatSet].sort((a, b) => a - b);
}

async function createReservationFromPayload(payload: any, sessionUserID?: string) {
    const userID = typeof payload.user === "string" && payload.user.length > 0
        ? payload.user
        : sessionUserID;

    if (!userID) {
        throw createHttpError(401, "You must be logged in to create a reservation");
    }

    const lab = await resolveLabFromPayload(payload);
    const seatNumbers = normalizeSeatNumbers(payload);

    if (!payload.date || !payload.startTime || !payload.endTime) {
        throw createHttpError(400, "date, startTime, and endTime are required");
    }

    const reservationDate = parseDateOnly(payload.date);
    const startTime = combineDateAndTime(reservationDate, payload.startTime);
    const endTime = combineDateAndTime(reservationDate, payload.endTime);

    ensureThirtyMinuteSlotRange(startTime, endTime);

    const conflictingReservations = await findConflictingReservations(
        lab.id,
        seatNumbers,
        reservationDate,
        startTime,
        endTime
    );

    const conflictingSeatNumbers = extractConflictingSeatNumbers(conflictingReservations, seatNumbers);

    if (conflictingSeatNumbers.length > 0) {
        throw createHttpError(
            409,
            `Seat(s) ${conflictingSeatNumbers.join(", ")} are already reserved for the selected time slot`
        );
    }

    const dateRequested = payload.dateRequested
        ? parseFlexibleDate(payload.dateRequested, "dateRequested")
        : new Date();

    const newReservation = await Reservation.create({
        user: userID,
        lab: lab._id,
        seatNumbers,
        isAnonymous: Boolean(payload.isAnonymous),
        date: reservationDate,
        dateRequested,
        startTime,
        endTime,
        status: payload.status === "cancelled" ? "cancelled" : "upcoming"
    });

    await newReservation.populate("lab", "room");
    return newReservation;
}

function calculateReservationStatus(reservation: any) {
    if (reservation.status === "cancelled") {
        return "cancelled";
    }

    const now = new Date();
    const reservationDate = new Date(reservation.date);
    const reservationEnd = new Date(reservation.endTime);

    const isSameDay = reservationDate.getFullYear() === now.getFullYear()
        && reservationDate.getMonth() === now.getMonth()
        && reservationDate.getDate() === now.getDate();

    if (reservationEnd.getTime() < now.getTime()) {
        return "past";
    }

    if (isSameDay) {
        return "today";
    }

    return "upcoming";
}

function serializeReservation(reservation: any) {
    const plainReservation = typeof reservation.toObject === "function"
        ? reservation.toObject()
        : reservation;

    plainReservation.status = calculateReservationStatus(plainReservation);
    return plainReservation;
}

// RESERVATION FORM

app.get('/reservation', async (_req, res) =>{
    try { 
        const formPath = path.join(__dirname, '../../reservation.html');

        return res.sendFile(formPath, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                if (!res.headersSent) {
                    res.status(404).json({ message: "Reservation form cannot be found" });
                }   
            }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({message: "Cannot load path"});
    }
})

app.post('/reservation', async (req, res) => {
    try {
        const { building, floor, capacity } = req.body;
        
        if (!building) {
            res.status(400).json({message: "Missing building"});
        }
        else if (!floor) {
            res.status(400).json({message: "Missing floor"});
        }
        else if (!capacity) {
            res.status(400).json({message: "Missing capacity"});
        }
        else {
            res.status(200).json({message: 'Successful reservation redirect'})
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Redirect unsuccessful"});
    }
})

// SLOT SCHEDULES

app.get('/view-slot-availability', async (_req, res) => {
    try { 
        const filePath = path.join(__dirname, '../../view-slot-availability.html');

        return res.sendFile(filePath, (err) => {
            if (err) {
                console.error("Could not find file", err);
                res.status(404).json({message: "Cannot find path"});
            }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({message: "Cannot load path"});
    }
})

app.post('/view-slot-availability', async (req, res) => {
    try {
        const { room, time } = req.body;
        
        if (!room) {
            res.status(400).json({message: "Missing room code"});
        }
        else if (!time) {
            res.status(400).json({message: "Time slot is missing"});
        }
        else {
            res.status(200).json({message: 'Successful reservation redirect'})
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Redirect unsuccessful"});
    }
})

// FOR SPECIFIC SEATS

app.get('/seat-reservation', async (_req, res) => {
    try { 
        const filePath = path.join(__dirname, '../../seat-reservation.html');

        return res.sendFile(filePath, (err) => {
            if (err) {
                console.error("Could not find file", err);
                res.status(404).json({message: "Cannot find path"});
            }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({message: "Cannot load path"});
    }
})

app.post('/seat-reservation', async (req: any, res) => {
    try {
        const { building, floor, room, date, startTime, endTime } = req.body;

        if (!building || !floor || !room || !date || !startTime || !endTime) {
            return res.status(400).json({ message: "Missing required seat reservation details" });
        }

        const rawSeatSelection = req.body.seatNumbers ?? req.body.seatNumber;
        const hasSeatSelection = Array.isArray(rawSeatSelection)
            ? rawSeatSelection.length > 0
            : rawSeatSelection !== undefined && rawSeatSelection !== null && rawSeatSelection !== "";

        if (!hasSeatSelection) {
            return res.status(200).json({
                message: "Seat reservation details staged successfully",
                details: { building, floor, room, date, startTime, endTime }
            });
        }

        const createdReservation = await createReservationFromPayload(req.body, req.session?.userID);

        return res.status(201).json({
            message: "Reservation created",
            id: createdReservation.id,
            reservation: serializeReservation(createdReservation)
        });
    }
    catch (error) {
        console.error(error);
        return res.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
});



