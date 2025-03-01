const express = require('express');
const app = express();
require('./config/mongoconfig');
const cors = require("cors");

//const path = require('path');

// Express setup
app.use(express.json());
app.use(cors());

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