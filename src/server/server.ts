import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import * as bcrypt from 'bcrypt';

import User from './models/user.model';
import Reservation from './models/reservation.model';
import Lab from './models/lab.model';
import { ActivityDTO } from '../shared/modelTypes';
import Activity from './models/activity.model';
import Building from './models/building.model';
import { BUILDING_LABELS, LAB_SEAT_CONFIG, getLabsForBuildingFloor, normalizeBuildingCode, parseFloorNumber } from '../shared/labSeatConfig';
import { promisify } from 'util';

import dotenv from 'dotenv';
dotenv.config();

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const session = require('express-session')
app.use(express.static(path.join(process.cwd())));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,    
    cookie: {
        httpOnly: true
    }
}));

const MINIMUM_PASSWORD_LENGTH = 4;
const REMEMBER_ME_LENGTH = 1000 * 60 * 60 * 24 * 30; //30 days
// const REMEMBER_ME_LENGTH = 1000 * 10; //10 seconds
const SALT_ROUNDS = 12;

app.post("/signup", async (request: any, response: any) => {
    const { email, password, rememberMe } = request.body;

    const regex = /^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)+@dlsu\.edu\.ph$/
    if (!regex.test(email)) {
        response.status(400).json({ message: "Invalid email format! Use your dlsu email!" });
        return;
    }

    if (password.length < MINIMUM_PASSWORD_LENGTH) {
        response.status(400).json({ message: `Password must be atleast ${MINIMUM_PASSWORD_LENGTH} long!` });
        return;
    }
    try {
        const role = normalizeUserRole(request.body.role);
        const defaultUsername = email.split("@")[0];
        const splitDefaultUserName = defaultUsername.split("_");
        const defaultFirstName = capitalizeFirstLetter(splitDefaultUserName[0]);
        const defaultLastName = capitalizeFirstLetter(splitDefaultUserName[splitDefaultUserName.length - 1]);
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = new User({
            firstName: defaultFirstName,
            lastName: defaultLastName,
            email,
            role,
            password: hashedPassword,
        });
        await newUser.save();

        request.session.userID = newUser.id;
        if (rememberMe) {
            request.session.cookie.maxAge = REMEMBER_ME_LENGTH;
        } else {
            request.session.cookie.maxAge = undefined;
        }

        return response.status(201).json({ message: "User created!", user: newUser._id });
    } catch (errorRecieved) {
        const error = errorRecieved as any;
        if (error.code === 11000) {
            return response.status(400).json({ message: "Account with email already exists!" });
        }

        return response.status(getErrorStatus(error)).json({ message: error.message });
    }
});


app.post("/login", async (request, response) => {
    const {email, password, rememberMe} = request.body;
    try {
        const user = await User.findOne({email})
        if (!user) {
            return response.status(400).json({message: "User with email doesn't exist!"})
        }

        const hashedPasswordMatch = await bcrypt.compare(password, user.password);
        if (!hashedPasswordMatch) {
            return response.status(400).json({message: "Invalid Password!"})
        }

        request.session.userID = user.id;
        if (rememberMe) {
            request.session.cookie.maxAge = REMEMBER_ME_LENGTH;
        } else {
            request.session.cookie.maxAge = undefined;
        }

        return response.status(201).json({ message: "User found!", user: user._id});
    } catch (errorRecieved) {
        const error = errorRecieved as any;

        if (error.code === 11000) //11000 is code for attempting to add an existing document field with a unique key
            return response.status(400).json({message: "Account with email already exists!"})

        return response.status(404).json({ message: error.message });
    }
})

app.post('/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
        if (err) {
            console.log(`destroy called: ${err}`)
            return res.status(400).json({ message: err.message });
        }
        res.clearCookie('connect.sid', { path: '/' });
        return res.json({ message: "Logged out" });
    });
})

app.delete('/delete-account', async (req: any, res) => {
    try {
        const userID = req.session?.userID;

        if (!userID) {
            res.status(400).json({message: `No user with that name or ID, ${userID} uh huh` });
        }
        else {
            await Activity.deleteMany({ user: userID });
            await Reservation.deleteMany({ user: userID });
            await User.findByIdAndDelete(userID);
            
            const destroySession = promisify(req.session.destroy.bind(req.session));
            await destroySession();
            res.clearCookie('connect.sid', { path: '/' });
            res.status(200).json({ message: 'Account data deleted successfully' });
        }
    }
    catch (error) {
        res.status(400).json({message: (error as any).message})
    }
})

app.put(`/change-password`, async (request, response) => {
    try {
        const {currentPassword, newPassword, confirmNewPassword} = request.body;
        const user = await requireAuth(request);
        if (newPassword !== confirmNewPassword)
            return response.status(400).json({message: `Confirm new password does not match new password`});

        const correctCurrentPassword = await bcrypt.compare(currentPassword, user.password);
        if (!correctCurrentPassword)
            return response.status(400).json({message: `Invalid current password`});

        const newPassIsSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (newPassIsSameAsOld)
            return response.status(400).json({message: `New password cannot be the same as old password`});

        if (newPassword.length < MINIMUM_PASSWORD_LENGTH) {
            response.status(400).json({ message: `Password must be atleast ${MINIMUM_PASSWORD_LENGTH} characters long!` });
            return;
        }

        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.save();
        return response.status(200).json({message: `Password changed successfully! Redirecting to home page...`});
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });   
    }
})

app.get(`/auth/check`, (request, response) => {
    console.log("Session ID:", request.sessionID);
    console.log("User ID in session:", request.session.userID);
    if (request.session.userID)
        return response.json({ loggedIn: true, userID: request.session.userID}); //USER ID FOR TESTING PURPOSES WILL BE REMOVED

    return response.json({ loggedIn: false });
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
        const currentUser = await requireAuth(request);

        const newReservation = await createReservationFromPayload(request.body, currentUser);

        await createReservationActivities(newReservation, "reserved");

        return response.status(201).json({
            message: `Reservation created`,
            id: newReservation.id,
            reservation: serializeReservation(newReservation)
        });

    } catch (error) {
        const details = typeof error === "object" && error !== null && "details" in error
            ? (error as { details?: unknown }).details
            : undefined;

        return response
            .status(getErrorStatus(error))
            .json({ message: (error as Error).message, ...(details ? { details } : {}) });
    }
});

app.delete("/reservations/:id", async (request: any, response) => {
    try {
        const currentUser = await requireAuth(request);
        const reservation = await Reservation.findById(request.params.id).populate("lab", "room");

        if (!reservation) {
            return response.status(404).json({ message: "Reservation not found" });
        }

        if (!canEditReservation(currentUser, reservation)) {
            return response.status(403).json({ message: "You are not allowed to cancel this reservation" });
        }

        if (reservation.status !== "cancelled") {
            reservation.status = "cancelled";
            await reservation.save();
            await createReservationActivities(reservation, "cancelled");
        }

        return response.json({
            message: "Reservation cancelled",
            reservation: serializeReservation(reservation)
        });
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
});

app.get("/reservations/id/:id", async (request: any, response) => {
    try {
        const currentUser = await requireAuth(request);
        const reservation = await Reservation.findById(request.params.id)
            .populate("lab", "room");

        if (!reservation) {
            return response.status(404).json({ message: "Reservation not found" });
        }

        if (!canViewReservation(currentUser, reservation)) {
            return response.status(403).json({ message: "You are not allowed to view this reservation" });
        }

        return response.json(serializeReservation(reservation));
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
});

// FOR DASHBOARD
app.get("/users", async (req, res) => {
    try{
        const id = (await requireAuth(req))._id;
        const user = await User.findById(id).select("-password");
        
        if(!user){
            return res.status(400).json({message: "User not found"});
        }

        return res.json(user);
    } catch(error){
        return res.status(400).json({message: (error as any).message});
    }
});

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

app.put("/reservations/:id", async (request: any, response) => {
    try {
        const currentUser = await requireAuth(request);
        const existingReservation = await Reservation.findById(request.params.id);

        if (!existingReservation) {
            return response.status(404).json({ message: "Reservation not found" });
        }

        if (!canEditReservation(currentUser, existingReservation)) {
            return response.status(403).json({ message: "You are not allowed to edit this reservation" });
        }

        const nextLab = await resolveLabFromPayload({
            ...request.body,
            lab: request.body.lab ?? existingReservation.lab.toString()
        });

        const nextSeatNumbers =
            request.body.seatNumbers === undefined && request.body.seatNumber === undefined
                ? existingReservation.seatNumbers
                : normalizeSeatNumbers(request.body);

        ensureSeatNumbersWithinLabCapacity(nextLab.room, nextSeatNumbers);

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
        ensureReservationStartsInFuture(nextStartTime);

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
        existingReservation.isAnonymous = normalizeBoolean(request.body.isAnonymous, existingReservation.isAnonymous ?? false);
        existingReservation.date = nextDate;
        existingReservation.startTime = nextStartTime;
        existingReservation.endTime = nextEndTime;

        if (request.body.dateRequested !== undefined) {
            existingReservation.dateRequested = parseFlexibleDate(request.body.dateRequested, "dateRequested");
        }

        if (request.body.status === "cancelled") {
            existingReservation.status = "cancelled";
        }

        await existingReservation.save();
        await existingReservation.populate("lab", "room");

        return response.json(serializeReservation(existingReservation));
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
});

app.get("/reservations/user", async (request, response) => {
    try {
        const currentUser = await requireAuth(request);

        if (!canViewReservationCollection(currentUser, currentUser._id.toString())) {
            return response.status(403).json({ message: "You are not allowed to view these reservations" });
        }

        const reservations = await Reservation.find({ user: currentUser._id })
            .populate("lab", "room")
            .sort({ date: 1, startTime: 1 });

        return response.json(reservations.map(serializeReservation));
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
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


app.get("/availability", async (request, response) => {
    try {
        const buildingCode = normalizeBuildingCode(typeof request.query.building === "string" ? request.query.building : undefined);
        const floor = parseFloorNumber(typeof request.query.floor === "string" ? request.query.floor : undefined);
        const date = typeof request.query.date === "string" ? request.query.date : undefined;

        if (!buildingCode || !floor || !date) {
            return response.status(400).json({
                message: "building, floor, and date are required"
            });
        }

        const roomNames = getLabsForBuildingFloor(buildingCode, floor);

        if (roomNames.length === 0) {
            return response.json({
                building: buildingCode,
                buildingLabel: BUILDING_LABELS[buildingCode],
                floor,
                date,
                rooms: [],
                slots: buildDailyTimeSlots(date).map(({ startDateTime, endDateTime, ...slot }) => slot)
            });
        }

        const dayRange = getDayRange(date);
        const labs = await Lab.find({
            $or: [
                { room: { $in: roomNames } },
                { name: { $in: roomNames } }
            ]
        }).select("_id room name");

        const labIdByRoom = new Map(
            labs.map((lab: any) => [lab.room || lab.name, String(lab._id)])
        );
        const availableLabIds = Array.from(labIdByRoom.values());

        const reservations = availableLabIds.length === 0
            ? []
            : await Reservation.find({
                lab: { $in: availableLabIds },
                status: { $ne: "cancelled" },
                date: { $gte: dayRange.start, $lt: dayRange.end }
            })
                .populate("lab", "room name")
                .sort({ startTime: 1 });

        const slotDefinitions = buildDailyTimeSlots(date);

        const rooms = roomNames.map((roomName) => {
            const roomReservations = reservations.filter((reservation: any) => {
                const reservationRoom = reservation.lab?.room || reservation.lab?.name;
                return reservationRoom === roomName;
            });

            const capacity = getLabCapacity(roomName);

            const slots = slotDefinitions.map((slot) => {
                const overlappingReservations = roomReservations.filter((reservation: any) =>
                    new Date(reservation.startTime).getTime() < slot.endDateTime.getTime()
                    && new Date(reservation.endTime).getTime() > slot.startDateTime.getTime()
                );

                const occupiedSeatNumbers = Array.from(
                    new Set(
                        overlappingReservations.flatMap((reservation: any) =>
                            Array.isArray(reservation.seatNumbers) ? reservation.seatNumbers : []
                        )
                    )
                ).sort((left, right) => left - right);

                const occupiedCount = occupiedSeatNumbers.length;
                const remainingSeats = Math.max(0, capacity - occupiedCount);

                return {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    occupiedCount,
                    remainingSeats,
                    occupiedSeatNumbers,
                    status: occupiedCount === 0 ? "available" : remainingSeats === 0 ? "full" : "partial"
                };
            });

            return {
                room: roomName,
                capacity,
                slots
            };
        });

        return response.json({
            building: buildingCode,
            buildingLabel: BUILDING_LABELS[buildingCode],
            floor,
            date,
            rooms,
            slots: slotDefinitions.map(({ startDateTime, endDateTime, ...slot }) => slot)
        });
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
});


app.get("/activities/user", async (req, res) =>{
    try{
        const user = await requireAuth(req);
        const activities = await Activity.find({user: user._id})
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
app.get("/reservations", async (request: any, response) => {
    try {
        await requireTechnician(request);
        const reservations = await Reservation.find()
            .populate("lab", "room")
            .populate("user", "firstName lastName")
            .sort({ date: 1, startTime: 1 });

        return response.json(reservations.map(serializeReservation));
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
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
    

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if(MONGO_URI){
    mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to database!");
        app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Connection failed:", err.message);
    });
}

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

function createHttpError(status: number, message: string, details?: Record<string, unknown>) {
    const error = new Error(message) as Error & { status: number; details?: Record<string, unknown> };
    error.status = status;

    if (details) {
        error.details = details;
    }

    return error;
}


const TECHNICIAN_ROLES = new Set<string>(["Lab Technician", "Admin"]);
const RESERVATION_STATUSES = new Set(["upcoming", "today", "past", "cancelled"]);

function normalizeUserRole(role: unknown) {
    if (role === "Admin") {
        return "Lab Technician";
    }

    if (role === "Lab Technician" || role === "Student" || role === undefined || role === null || role === "") {
        return role === "Lab Technician" ? "Lab Technician" : "Student";
    }

    throw createHttpError(400, "Role must be either Student or Lab Technician");
}

function normalizeBoolean(value: unknown, fallback = false) {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (["true", "1", "yes", "on"].includes(normalized)) {
            return true;
        }

        if (["false", "0", "no", "off", ""].includes(normalized)) {
            return false;
        }
    }

    if (typeof value === "number") {
        if (value === 1) {
            return true;
        }

        if (value === 0) {
            return false;
        }
    }

    if (value === undefined || value === null) {
        return fallback;
    }

    throw createHttpError(400, "Invalid boolean value");
}

function getDocumentId(value: any) {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value.toString === "function") {
        return value.toString();
    }

    return String(value);
}

function hasTechnicianRole(user: any) {
    return TECHNICIAN_ROLES.has(String(user?.role ?? ""));
}

function hasStudentRole(user: any) {
    return String(user?.role ?? "") === "Student";
}

async function getCurrentUserFromSession(request: any) {
    const userID = request.session?.userID;

    if (!userID) {
        return null;
    }

    const currentUser = await User.findById(userID);

    if (!currentUser) {
        request.session.userID = undefined;
        return null;
    }

    return currentUser;
}

async function requireAuth(request: any) {
    const currentUser = await getCurrentUserFromSession(request);

    if (!currentUser) {
        throw createHttpError(401, "You must be logged in to continue");
    }

    return currentUser;
}

async function requireStudent(request: any) {
    const currentUser = await requireAuth(request);

    if (!hasStudentRole(currentUser)) {
        throw createHttpError(403, "Only students can perform this action");
    }

    return currentUser;
}

void requireStudent;

async function requireTechnician(request: any) {
    const currentUser = await requireAuth(request);

    if (!hasTechnicianRole(currentUser)) {
        throw createHttpError(403, "Only lab technicians can perform this action");
    }

    return currentUser;
}

function canViewReservationCollection(currentUser: any, requestedUserId: string) {
    if (hasTechnicianRole(currentUser)) {
        return true;
    }

    return getDocumentId(currentUser._id) === requestedUserId;
}

function canViewReservation(currentUser: any, reservation: any) {
    if (hasTechnicianRole(currentUser)) {
        return true;
    }

    return getDocumentId(currentUser._id) === getDocumentId(reservation.user);
}

function canEditReservation(currentUser: any, reservation: any) {
    if (hasTechnicianRole(currentUser)) {
        return true;
    }

    return hasStudentRole(currentUser) && getDocumentId(currentUser._id) === getDocumentId(reservation.user);
}

async function resolveReservationUserForCreate(payload: any, currentUser: any) {
    if (hasTechnicianRole(currentUser)) {
        const targetUserID = typeof payload.user === "string" && payload.user.trim().length > 0
            ? payload.user.trim()
            : getDocumentId(currentUser._id);

        const targetUser = await User.findById(targetUserID);

        if (!targetUser) {
            throw createHttpError(404, "Reservation user not found");
        }
        /*
        if (!hasStudentRole(targetUser)) {
            throw createHttpError(400, "Reservations can only be created for student accounts");
        }*/

        return targetUser;
    }

    if (!hasStudentRole(currentUser)) {
        throw createHttpError(403, "Only students or lab technicians can create reservations");
    }

    if (payload.user !== undefined && payload.user !== null && payload.user !== "" && payload.user !== getDocumentId(currentUser._id)) {
        throw createHttpError(403, "Students can only create reservations for themselves");
    }

    return currentUser;
}

function getLabCapacity(room: string) {
    return LAB_SEAT_CONFIG[room as keyof typeof LAB_SEAT_CONFIG]?.capacity ?? 20;
}

function ensureSeatNumbersWithinLabCapacity(room: string, seatNumbers: number[]) {
    const capacity = getLabCapacity(room);

    if (seatNumbers.some((seatNumber) => seatNumber > capacity)) {
        throw createHttpError(400, `Seat numbers must be between 1 and ${capacity} for ${room}`);
    }
}

function ensureReservationStartsInFuture(startTime: Date) {
    const now = new Date();

    if (startTime.getTime() < now.getTime()) {
        throw createHttpError(400, "Reservations must start in the future");
    }
}

function normalizeReservationStatus(value: unknown, fallback: "upcoming" | "today" | "past" | "cancelled" = "upcoming") {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    if (typeof value === "string" && RESERVATION_STATUSES.has(value)) {
        return value as "upcoming" | "today" | "past" | "cancelled";
    }

    throw createHttpError(400, "Invalid reservation status");
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
    // return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    return new Date(Date.UTC(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
    ));
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

    // return new Date(
    //     baseDate.getFullYear(),
    //     baseDate.getMonth(),
    //     baseDate.getDate(),
    //     hours,
    //     minutes,
    //     0,
    //     0
    // );
    return new Date(Date.UTC(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        hours,
        minutes,
        0,
        0
    ));
}

function getDayRange(value: string | Date) {
    const start = parseDateOnly(value);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
}


function buildDailyTimeSlots(dateValue: string | Date) {
    const slotDefinitions: Array<{
        startTime: string;
        endTime: string;
        label: string;
        startDateTime: Date;
        endDateTime: Date;
    }> = [];

    for (let hour = 8; hour < 18; hour += 1) {
        for (const minute of [0, 30]) {
            const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            const endHour = minute === 30 ? hour + 1 : hour;
            const endMinute = minute === 30 ? 0 : 30;
            const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

            const startDateTime = combineDateAndTime(dateValue, startTime);
            startDateTime.setUTCHours(startDateTime.getUTCHours() - 8);
            const endDateTime = combineDateAndTime(dateValue, endTime);
            endDateTime.setUTCHours(endDateTime.getUTCHours() - 8);

            slotDefinitions.push({
                startTime,
                endTime,
                label: startDateTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }),
                startDateTime,
                endDateTime
            });
        }
    }

    return slotDefinitions;
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

        return synchronizeLabRecord(existingLab, existingLab.building, existingLab.floor, existingLab.room);
    }

    const floor = Number(payload.floor);
    const room = normalizeRoomCode(payload.room);

    if (!Number.isInteger(floor)) {
        throw createHttpError(400, "Missing floor or room for reservation");
    }

    const buildingDoc = await resolveBuildingFromPayload(payload);

    const existingLab = await findLabByRoomOrLegacyName(room);

    if (existingLab) {
        return synchronizeLabRecord(existingLab, buildingDoc._id, floor, room);
    }

    try {
        const createdLab = await Lab.create({
            name: room,
            building: buildingDoc._id,
            floor,
            room,
            totalSeats: getLabCapacity(room)
        });

        return createdLab;
    } catch (error: any) {
        if (error?.code === 11000) {
            const recoveredLab = await findLabByRoomOrLegacyName(room);

            if (recoveredLab) {
                return synchronizeLabRecord(recoveredLab, buildingDoc._id, floor, room);
            }
        }

        throw error;
    }
}

function normalizeRoomCode(value: unknown) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw createHttpError(400, "Missing floor or room for reservation");
    }

    return value.trim();
}

async function findLabByRoomOrLegacyName(room: string) {
    const labByRoom = await Lab.findOne({ room });

    if (labByRoom) {
        return labByRoom;
    }

    const labByLegacyName = await Lab.findOne({ name: room });

    if (labByLegacyName) {
        return labByLegacyName;
    }

    return null;
}

async function synchronizeLabRecord(existingLab: any, buildingId: any, floor: number, room: string) {
    let shouldSave = false;

    if (existingLab.name !== room) {
        existingLab.name = room;
        shouldSave = true;
    }

    if (existingLab.room !== room) {
        existingLab.room = room;
        shouldSave = true;
    }

    if (getDocumentId(existingLab.building) !== getDocumentId(buildingId)) {
        existingLab.building = buildingId;
        shouldSave = true;
    }

    if (existingLab.floor !== floor) {
        existingLab.floor = floor;
        shouldSave = true;
    }

    const expectedCapacity = getLabCapacity(room);

    if (existingLab.totalSeats !== expectedCapacity) {
        existingLab.totalSeats = expectedCapacity;
        shouldSave = true;
    }

    if (shouldSave) {
        try {
            await existingLab.save();
        } catch (error: any) {
            if (error?.code === 11000) {
                const canonicalLab = await Lab.findOne({ room });

                if (canonicalLab) {
                    return canonicalLab;
                }
            }

            throw error;
        }
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

async function createReservationFromPayload(payload: any, currentUser: any) {
    const reservationUser = await resolveReservationUserForCreate(payload, currentUser);
    const lab = await resolveLabFromPayload(payload);
    const seatNumbers = normalizeSeatNumbers(payload);

    ensureSeatNumbersWithinLabCapacity(lab.room, seatNumbers);

    if (!payload.date || !payload.startTime || !payload.endTime) {
        throw createHttpError(400, "date, startTime, and endTime are required");
    }

    const reservationDate = parseDateOnly(payload.date);
    const startTime = combineDateAndTime(reservationDate, payload.startTime);
    const endTime = combineDateAndTime(reservationDate, payload.endTime);

    ensureThirtyMinuteSlotRange(startTime, endTime);
    ensureReservationStartsInFuture(startTime);

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
            `Seat(s) ${conflictingSeatNumbers.join(", ")} are already reserved for the selected time slot`,
            { conflictingSeatNumbers }
        );
    }

    const dateRequested = payload.dateRequested
        ? parseFlexibleDate(payload.dateRequested, "dateRequested")
        : new Date();

    const newReservation = await Reservation.create({
        user: reservationUser._id,
        lab: lab._id,
        seatNumbers,
        isAnonymous: normalizeBoolean(payload.isAnonymous, false),
        date: reservationDate,
        dateRequested,
        startTime,
        endTime,
        status: normalizeReservationStatus(payload.status, "upcoming") === "cancelled" ? "cancelled" : "upcoming"
    });

    await newReservation.populate("lab", "room");
    return newReservation;
}


async function createReservationActivities(reservation: any, action: "reserved" | "cancelled" | "admin-cancelled") {
    const reservationObject = typeof reservation.toObject === "function"
        ? reservation.toObject()
        : reservation;

    const seatNumbers = Array.isArray(reservationObject.seatNumbers) ? reservationObject.seatNumbers : [];
    const labName = reservationObject.lab?.room ?? reservationObject.room ?? "";

    if (seatNumbers.length === 0 || !labName) {
        return;
    }

    await Promise.all(
        seatNumbers.map((seatNumber: number) => Activity.create({
            user: reservationObject.user,
            reservation: reservationObject._id,
            action,
            seatNumber,
            labName,
            timestamp: new Date()
        }))
    );
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
        const { building, floor} = req.body;
        
        if (!building) {
            res.status(400).json({message: "Missing building"});
        }
        else if (!floor) {
            res.status(400).json({message: "Missing floor"});
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
        const currentUser = await requireAuth(req);
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

        const createdReservation = await createReservationFromPayload(req.body, currentUser);
        await createReservationActivities(createdReservation, "reserved");

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

app.get("/buildings", async (_req: any, res: any) => {
    try{
        const buildings = await Building.find();
        return res.json(buildings);
    } catch(error){
        return res.status(500).json({message: error});
    }
})

app.get("/labs", async (req: any, res: any) => {
    try{
        const {building, floor} = req.query
        if (!building) {
            return res.status(400).json({ message: "Building is required" });
        }

        let filter: any = { building: building };

        if (floor) {
            filter.floor = floor;  
        }

        const labs = await Lab.find(filter);
        res.json(labs);
    } catch(error){
        return res.status(500).json({message: error});
    }
});

app.get("/alllabs", async (_req: any, res: any) => {
    try{
        const labs = await Lab.find();
        return res.json(labs);
    } catch(error){
        return res.status(500).json({message: error});
    }
});


app.post("/reservations/quick", async (req: any, res: any) => {
    const user = await requireAuth(req);

    const{lab, date, isAnonymous, startTime, endTime} = req.body;

    const labData = await Lab.findById(lab);

    const reservations = await Reservation.find({
        lab,
        date,
        status: { $ne: "cancelled" },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    })

    const reservedSeats = reservations.flatMap(r => r.seatNumbers);

    let freeSeat = null;

    if(labData){
        if(labData.totalSeats){
            for (let i = 1; i <= labData.totalSeats; i++) {
                if (!reservedSeats.includes(i)) {
                    freeSeat = i;
                    break;
                }
            }
        }
    }

    if (!freeSeat) {
        return res.status(400).json({
            message: "No seats available"
        });
    }

    const reservation = await Reservation.create({
        user: user._id,
        lab,
        seatNumbers: [freeSeat],
        date,
        startTime,
        endTime,
        dateRequested: new Date(),
        isAnonymous
    });
    await reservation.populate("lab", "room");
    await createReservationActivities(reservation, "reserved");
    res.json(reservation);
});

app.get("/reservations/user/:id", async (request, response) => {
    try {
        const requestedUser = request.params.id;

        const reservations = await Reservation.find({ user: requestedUser})
            .populate("lab", "room")
            .sort({ date: 1, startTime: 1 });

        return response.json(reservations.map(serializeReservation));
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
});

app.get("/auth/me", async (request: any, response: any) => {
    try {
        const currentUser = await getCurrentUserFromSession(request);

        if (!currentUser) {
            return response.status(401).json({ message: "No active session" });
        }

        return response.json({
            _id: currentUser._id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            role: currentUser.role,
            description: currentUser.description ?? ""
        });
    } catch (error) {
        return response.status(500).json({ message: (error as Error).message });
    }
});

app.get("/reservations/all", async (request: any, response) => {
    try {
        await requireAuth(request);
        const reservations = await Reservation.find()
            .populate("lab", "room")
            .populate("user", "firstName lastName")
            .sort({ date: 1, startTime: 1 });

        return response.json(reservations.map(serializeReservation));
    } catch (error) {
        return response.status(getErrorStatus(error)).json({ message: (error as Error).message });
    }
});

app.patch("/reservations/cancel", async (req, res) => {
    try {
        const { reservationIds } = req.body;
        const user = await requireAuth(req);

        const reservations = await Reservation.find({
            _id: { $in: reservationIds }
            }).populate("lab", "room");

        await Reservation.updateMany(
            { _id: { $in: reservationIds } },
            { $set: { status: "cancelled" } }
        );

        if(user.role === "Student"){
            await Promise.all(
                reservations.map((reservation) => createReservationActivities(reservation, "cancelled"))
            );
        } else{
            await Promise.all(
                reservations.map((reservation) => {
                    if(reservation.user.toString() === user._id.toString()){
                        return createReservationActivities(reservation, "cancelled");
                    } else{                                                      
                        return createReservationActivities(reservation, "admin-cancelled");
                    }
                })
            );
        }

        res.json({ message: "Cancelled" });
    } catch (error) {   
        console.error(error);
        res.status(500).json({ message: (error as Error).message });
    }
});

app.patch("/reservations/cancel-seat", async (req, res) => {
    try {
        const { reservationId, seatNumber } = req.body;
        const user = await requireAuth(req);

        if (!reservationId || typeof seatNumber !== "number") {
            return res.status(400).json({
                message: "reservationId and seatNumber are required"
            });
        }

        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (
            user.role !== "Admin" &&
            reservation.user.toString() !== user._id.toString()
        ) {
            return res.status(403).json({ message: "Not allowed" });
        }

        if (!reservation.seatNumbers.includes(seatNumber)) {
            return res.status(400).json({
                message: "Seat not part of this reservation"
            });
        }

        if (reservation.seatNumbers.length === 1) {
            reservation.status = "cancelled";
            await reservation.save();
            return res.json({ message: "Seat cancelled successfully" });
        }
            
        let updatedSeats: number[] | undefined = undefined;
        if(reservation.seatNumbers.length > 1){
            updatedSeats = reservation.seatNumbers = reservation.seatNumbers.filter(
                (seat: number) => seat !== seatNumber
            );
        }

        if(updatedSeats) 
            reservation.seatNumbers = updatedSeats;
        
        await reservation.save();

        let activityType: "cancelled" | "admin-cancelled" = "cancelled";

        if (user.role === "Admin") {
            activityType =
                reservation.user.toString() === user._id.toString()
                    ? "cancelled"
                    : "admin-cancelled";
        }

        await reservation.save();
        await createReservationActivities(reservation, activityType);

        res.json({ message: "Seat cancelled successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: (error as Error).message });
    }
});