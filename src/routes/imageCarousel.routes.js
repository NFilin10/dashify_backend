const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateMiddleware = require("../middlewares/auth.middleware");
const {getCarouselImages, deleteCarouselImage, uploadCarouselImage} = require("../controllers/imageCarouselController");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

router.get("/get-carousel-images", authenticateMiddleware, getCarouselImages);
router.post("/upload-carousel-image", authenticateMiddleware, upload.single("image"), uploadCarouselImage);
router.delete("/delete-carousel-image", authenticateMiddleware, deleteCarouselImage);

router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
