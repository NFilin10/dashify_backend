const {
    handleAddWidgetPosition,
    handleUpdateWidgetPosition,
    handleGetWidgetPositions,
    handleDeleteWidgetPosition,
    handleAddWidget
} = require('../controllers/freeposController');
const express = require('express');
const router = express.Router();

router.post("/add-widget-position", handleAddWidgetPosition);
router.post("/add-widget", handleAddWidget);


router.put("/update-widget-position", handleUpdateWidgetPosition);

router.get("/get-widget-positions", handleGetWidgetPositions);

router.delete("/delete-widget", handleDeleteWidgetPosition);

module.exports = router;
