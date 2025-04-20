const express = require('express');
const router = express.Router();
const {
    handleSaveCity,
    handleGetWeather
} = require('../controllers/weatherController');
const authenticateMiddleware = require("../middlewares/auth.middleware");

router.post("/save-city", handleSaveCity);
router.get("/get-weather", handleGetWeather);

module.exports = router;
