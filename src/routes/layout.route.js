const express = require('express');
const { handleSaveLayoutSettings, handleGetLayoutSettings, handleUploadImage, handleDeleteImage } = require('../controllers/layoutController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateMiddleware = require("../middlewares/auth.middleware");

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

router.put('/save-layout-settings', authenticateMiddleware, handleSaveLayoutSettings);
router.get("/get-layout-settings", authenticateMiddleware, handleGetLayoutSettings);
router.post("/upload-image", authenticateMiddleware, upload.single("image"), handleUploadImage);
router.delete("/delete-image", authenticateMiddleware, handleDeleteImage);

router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
