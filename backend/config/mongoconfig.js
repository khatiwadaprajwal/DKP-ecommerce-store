const mongoose = require("mongoose");
require('dotenv').config();


const dbUrl= process.env.dbUrl

mongoose.connect(dbUrl, {
   
    autoIndex: true,
    autoCreate: true,
})
.then(() => {
    console.log("✅ MongoDB Atlas Connected Successfully!");
})
.catch((error) => {
    console.error("❌ Error connecting to MongoDB Atlas:", error.message);
});

module.exports = mongoose.connection;
