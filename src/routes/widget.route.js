const { handleAddWidget } = require('./../controllers/widgetController');
const express = require('express');
const router = express.Router();

router.post("/add-widget", handleAddWidget);

module.exports = router;
