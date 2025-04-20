const {
    handleAddWidgetPosition,
    handleUpdateWidgetPosition,
    handleGetWidgetPositions,
    handleDeleteWidgetPosition,
    handleAddWidget
} = require('../controllers/freeposController');
const express = require('express');
const authenticateMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/add-widget-position", authenticateMiddleware, handleAddWidgetPosition);
router.post("/add-widget", authenticateMiddleware, handleAddWidget);


router.put("/update-widget-position", authenticateMiddleware, handleUpdateWidgetPosition);

router.get("/get-widget-positions", authenticateMiddleware, handleGetWidgetPositions);

router.delete("/delete-widget", authenticateMiddleware, handleDeleteWidgetPosition);

module.exports = router;
