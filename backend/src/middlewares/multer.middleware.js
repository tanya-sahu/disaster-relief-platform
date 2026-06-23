import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // file is middleware multer
    cb(null, "./public/temp"); // where alll files are kept
  },
  filename: function (req, file, cb) {
    // filename kuch bhi rakh sakte
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
