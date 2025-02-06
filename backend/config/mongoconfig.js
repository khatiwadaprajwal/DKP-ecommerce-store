const mongoose = require("mongoose");
const dbUrl = "mongodb://127.0.0.1:27017/collegeproject";
mongoose.connect(dbUrl, {
    autoIndex: true,
    autoCreate: true
});

const db = mongoose.connection;

db.on("error", (error) => {
    console.error("Error connecting database:", error.message);
});

db.once("open", () => {
    console.log("Database Connected Successfully!");
});