var express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require("cors");
const User = require('./models/user.model');

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.post("/signup", async (request, response) => {
    const {email, password, role} = request.body;
    if (!email.includes("@") && !email.endsWith(".com")) {
        response.status(400).json({ message: "Invalid email format!" });
        return;
    }

    try {
        const defaultUsername = email.split("@")[0];
        const newUser = new User({
            firstName: defaultUsername,
            lastName: "",
            email,
            role,
            password,
        })

        await newUser.save();
        response.status(201).json({ message: "User created!", user: newUser._id});
    } catch (error) {
        if (error.code === 11000) //11000 is code for attempting to add an existing document field with a unique key
            response.status(400).json({message: "Account with email already exists!"})

        response.status(400).json({ message: error.message});
    }
})


app.post("/login", async (request, response) => {
    const {email, password} = request.body;
    try {
        const user = await User.findOne({email})
        if (!user) {
            response.status(400).json({message: "User with email doesn't exist!"})
            return;
        }

        if (user.password !== password) {
            response.status(400).json({message: "Ivalid Password!"})
            return;
        }

        response.status(201).json({ message: "User found!", user: user._id});
    } catch (error) {
        if (error.code === 11000) //11000 is code for attempting to add an existing document field with a unique key
            response.status(400).json({message: "Account with email already exists!"})

        response.status(400).json({ message: error.message });
    }
})

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
