

const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Storage configuration
const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = path.join(__dirname, "../public");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        let filename = Date.now() + "." + file.originalname.split(".").pop();
        cb(null, filename);
    }
});

// File filter
const uploader = multer({
    storage: myStorage,
    fileFilter: (req, file, cb) => {
        let allowed = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'pdf', 'jfif'];
        let ext = file.originalname.split(".").pop().toLowerCase();

        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"), false);
        }
    }
});

module.exports = uploader; 
