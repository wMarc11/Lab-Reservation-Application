import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';

import User from './models/user.model';
import Reservation from './models/reservation.model';
import Lab from './models/lab.model';
import { ReservationDTO } from '../shared/modelTypes';
import { ActivityDTO } from '../shared/modelTypes';
import Activity from './models/activity.model';

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

app.post(`/reservations`, async (request, response) => {
    try {
        const info = request.body as ReservationDTO;
        const newReservation = new Reservation(info);

        await newReservation.save();
        return response.status(201).json({message: `Reservation create`, id: newReservation.id})
    } catch (error) {
        return response.status(400).json({message: (error as any).message})
    }
})

app.delete("/reservations/:id", async (request, response) => {
    try {
        await Reservation.findByIdAndDelete(request.params.id);
        response.status(201).json({ message: "Reservation cancelled" });
    } catch (error) {
        response.status(400).json({ message: (error as any).message });
    }
});

app.get("/reservations/id/:id", async (req, res) =>{
    try{
        const reservation = await Reservation.findById(req.params.id)
        if (!reservation)
            return res.status(404).json({ message: "Reservation not found" });
        
        return res.json(reservation);
    } catch(error){
        return res.status(500).json({message: (error as any).message});
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
        const updated = await Reservation.findByIdAndUpdate(
            request.params.id,
            request.body,
            { returnDocument: 'after' }
        );
        if (!updated) 
            return response.status(404).json({ message: "Reservation not found" });

        return response.json(updated);
    } catch (error) {
        return response.status(500).json({ message: (error as any).message });
    }
});

app.get("/reservations/user/:id", async(req, res) => {
    try {
        const reservations = await Reservation.find({user: req.params.id})
            .populate("lab", "room")
            .sort({date: 1});
        res.json(reservations);
    } catch(error){
        res.status(400).json({message: (error as any).message});
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
app.get("/reservations", async (_, res) =>{
    try{
        const reservations = await Reservation.find()
            .populate("lab", "room")
            .populate("user", "firstName, lastName")
            .sort({date: 1})
        res.json(reservations);
    } catch(error){
        res.status(400).json({message: (error as any).message});
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
    
mongoose.connect("mongodb+srv://marc:PfNo93spmJUkuMLR@labreservation.8crxdrf.mongodb.net/?appName=LabReservation")
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

app.post('/seat-reservation', async (req, res) => {
    try {
        const { building, floor, room, date, startTime, endTime } = req.body;

        if (!building || !floor || !room || !date || !startTime || !endTime) {
            return res.status(400).json({ message: "Missing required seat reservation details" });
        }

        return res.status(200).json({
            message: "Seat reservation details staged successfully",
            details: { building, floor, room, date, startTime, endTime }
        });
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({message: "Redirect unsuccessful"});
    }
})



