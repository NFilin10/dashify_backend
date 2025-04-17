const express = require('express');
const router = express.Router();
const {
    handleSaveNote,
    handleGetNoteForWidget
} = require('../controllers/noteController');

router.post("/save-note", handleSaveNote);

router.get("/get-note", handleGetNoteForWidget);

module.exports = router;
