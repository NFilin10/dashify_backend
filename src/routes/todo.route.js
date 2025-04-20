const express = require('express');
const router = express.Router();
const {
    handleAddTask,
    handleCompleteTask,
    handleGetTasks,
    handleDeleteTask
} = require('./../controllers/todoController');
const authenticateMiddleware = require("../middlewares/auth.middleware");

router.post("/add-task", authenticateMiddleware, handleAddTask);
router.put('/complete-task', authenticateMiddleware, handleCompleteTask);
router.get("/get-tasks", authenticateMiddleware, handleGetTasks);
router.delete("/delete-task", authenticateMiddleware, handleDeleteTask);

module.exports = router;
