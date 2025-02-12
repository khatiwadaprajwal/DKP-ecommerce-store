const multer = require("multer");

const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let path = "public/";
        cb(null, path)
    },
    filename: (req, file, cb) =>{

        let filename = Date.now()+"."+file.originalname.split(".").pop();
        console.log(filename)
        cb(null, filename);
    }
})

const uploader = multer({
    storage: myStorage,
    fileFilter: (req, file, cb) => {
        let ext_parts = file.originalname.split(".");        
        let ext = ext_parts.pop();
        
        
        try{   
            let allowed = ['jpg', 'jpeg', 'png','gif','bmp','webp','svg','pdf','jfif'];
            if(allowed.includes(ext.toLowerCase())){
                cb(null, true);
            } else {
                cb(null, false);
            }
        } catch(error) {
            console.log("Error: ", error);
        }
    }
});


module.exports = uploader;