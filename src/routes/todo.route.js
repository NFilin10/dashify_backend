const express = require('express');
const router = express.Router();
const {
    handleAddTask,
    handleCompleteTask,
    handleGetTasks,
    handleDeleteTask
} = require('./../controllers/todoController');

router.post("/add-task", handleAddTask);
router.put('/complete-task', handleCompleteTask);
router.get("/get-tasks", handleGetTasks);
router.delete("/delete-task", handleDeleteTask);

module.exports = router;
