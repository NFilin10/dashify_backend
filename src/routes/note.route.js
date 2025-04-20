const express = require('express');
const router = express.Router();
const {
    handleSaveNote,
    handleGetNoteForWidget
} = require('../controllers/noteController');
const authenticateMiddleware = require("../middlewares/auth.middleware");

router.post("/save-note", authenticateMiddleware, handleSaveNote);

router.get("/get-note", authenticateMiddleware, handleGetNoteForWidget);

module.exports = router;
