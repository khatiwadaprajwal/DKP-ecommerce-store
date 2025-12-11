const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load .env variables
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Ensure these match your .env keys
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, 
});

module.exports = cloudinary;