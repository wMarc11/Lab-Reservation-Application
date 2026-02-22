var express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require("cors");

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

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
