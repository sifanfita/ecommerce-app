import multer from "multer";

const storage = multer.diskStorage({
    filename: function (req, file, callback){
        callback(null, Date.now() + "-" + file.originalname)
    } 

});

// using the storage we will create upload middleware

const upload = multer({storage})

export default upload;