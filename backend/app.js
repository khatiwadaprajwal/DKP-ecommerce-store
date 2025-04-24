const express = require('express');
const app = express();
require('./config/mongoconfig');
const cors = require("cors");



const path = require('path');

// Express setup
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/public", express.static(path.join(__dirname, "public")));


//routes connected
const routes = require("./routes/index")
app.use("/v1", routes);





app.listen(3001, "localhost", (err) => {
    if (err) {
        console.log("Server Error:", err);
    } else {
        console.log("Server connected to port 3001");
        console.log("Press Ctrl + C to end the connection");
    }
});