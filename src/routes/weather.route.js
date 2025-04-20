const express = require('express');
const router = express.Router();
const {
    handleSaveCity,
    handleGetWeather
} = require('../controllers/weatherController');
const authenticateMiddleware = require("../middlewares/auth.middleware");

router.post("/save-city", authenticateMiddleware, handleSaveCity);
router.get("/get-weather", authenticateMiddleware, handleGetWeather);

module.exports = router;
