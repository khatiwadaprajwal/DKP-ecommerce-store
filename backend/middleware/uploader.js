import cloudinary from "../config/cloudnary.js";
import fs from "fs"; 

export const uploadToCloudinary = async (req, res) => {
    try {
     
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const localPath = req.file.path;
        console.log("UPLOADING FILE:", localPath);

        
        const result = await cloudinary.uploader.upload(localPath, {
            folder: "uploads", 
            resource_type: "auto", // Handles images/videos automatically
        });

        
        try {
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
            }
        } catch (fsError) {
            console.error("Error deleting local file:", fsError);
        }

        // 4. Send Response
        return res.status(200).json({
            message: "File uploaded to Cloudinary successfully",
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
      
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error("Cloudinary Upload Error:", error);
        return res.status(500).json({ error: "Upload failed", details: error.message });
    }
};