const express = require('express');
const app = express();
require('./config/mongoconfig');
const cors = require("cors");
const cookieParser = require("cookie-parser");


const path = require('path');
require("./utils/cleanupjob");

// Express setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://192.168.1.64:5173",
        "http://192.168.1.64:3000",
        "https://dkp-ecommerce-store-frontend.onrender.com"
    ], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
}));

app.use("/public", express.static(path.join(__dirname, "public")));

//routes connected
const routes = require("./routes/index")
app.use("/v1", routes);



app.listen(3001, "0.0.0.0", (err) => {
    if (err) {
        console.log("Server Error:", err);
    } else {
        console.log("Server connected to port 3001");
        console.log("Press Ctrl + C to end the connection");
    }
});
