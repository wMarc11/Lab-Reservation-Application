var express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require("cors");
const User = require('./models/user.model');
const Reservation = require('./models/reservation.model');

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const path = require("path");
app.use(express.static(path.join(__dirname)));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.post("/signup", async (request, response) => {
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

        await newUser.save();
        return response.status(201).json({ message: "User created!", user: newUser._id});
    } catch (error) {
        if (error.code === 11000) //11000 is code for attempting to add an existing document field with a unique key
           return response.status(400).json({message: "Account with email already exists!"})

        return response.status(400).json({ message: error.message});
    }
})


app.post("/login", async (request, response) => {
    const {email, password} = request.body;
    try {
        const user = await User.findOne({email})
        if (!user) {
            return response.status(400).json({message: "User with email doesn't exist!"})
        }

        if (user.password !== password) {
            return response.status(400).json({message: "Invalid Password!"})
        }

        response.status(201).json({ message: "User found!", user: user._id});
    } catch (error) {
        if (error.code === 11000) //11000 is code for attempting to add an existing document field with a unique key
            return response.status(400).json({message: "Account with email already exists!"})

        return response.status(404).json({ message: error.message });
    }
})


// FOR DASHBOARD
app.get("/users/:id", async (req, res) => {
    try{
        const user = await User.findById(req.params.id).select("-password");
        
        if(!user){
            return res.status(400).json({message: "User not found"});
        }

        res.json(user);
    } catch(error){
        res.status(400).jsoon({message: error.message});
    }
});

app.get("/reservations/user/:id", async(req, res) => {
    try {
        const reservations = await Reservation.find({user: req.params.id})
            .populate("lab", "name")
            .sort({date: 1});
        res.json(reservations);
    } catch(error){
        res.status(400).json({message: error.message});
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


function capitalizeFirstLetter(string) {
  if (!string || string.length === 0) { 
    return "";
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}