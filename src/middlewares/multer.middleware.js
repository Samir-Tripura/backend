/*import multer from "multer";


// Set up multer disk storage configuration

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public\temp')
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname)
  }
})


export const upload = multer({ 
    storage,
})*/

import multer from "multer";
import path from "path";

// Set up multer disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "public", "temp")); // Use absolute path
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});