const cloudinary = require("../config/cloudnary"); 
const path = require("path");

const uploadToCloudinary = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const localPath = req.file.path;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(localPath, {
            folder: "uploads", // optional: your custom folder in Cloudinary
        });

        // Optional: Delete local file after upload
        fs.unlinkSync(localPath);

        return res.status(200).json({
            message: "File uploaded to Cloudinary successfully",
            url: result.secure_url,
        });
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return res.status(500).json({ error: "Upload failed" });
    }
};

module.exports = { uploadToCloudinary };
