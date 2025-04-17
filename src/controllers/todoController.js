const pool = require("../database");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

function extractUserId(req) {
    const token = req.cookies.jwt;
    if (!token) {
        throw new Error("No token provided");
    }
    try {
        const decoded = jwt.verify(token, secret);
        return decoded.id;
    } catch {
        throw new Error("Invalid or expired token");
    }
}

async function handleAddTask(req, res) {
    try {
        const { todo_list_id, task } = req.body;
        if (!todo_list_id || !task) {
            return res.status(400).json({ message: "Missing todo_list_id or task" });
        }

        await pool.query(
            "INSERT INTO todo_tasks (todo_list_id, task) VALUES ($1, $2)",
            [todo_list_id, task]
        );

        res.status(201).json({ message: "Task added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while adding task" });
    }
}

async function handleCompleteTask(req, res) {
    try {
        const { task_id } = req.body;
        if (!task_id) {
            return res.status(400).json({ message: "Missing task_id" });
        }

        await pool.query(
            "UPDATE todo_tasks SET completed = TRUE WHERE id = $1",
            [task_id]
        );

        res.status(200).json({ message: "Task marked as completed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while updating task" });
    }
}

async function handleGetTasks(req, res) {
    try {
        const { todo_list_id } = req.query;
        if (!todo_list_id) {
            return res.status(400).json({ message: "Missing todo_list_id" });
        }

        const result = await pool.query(
            "SELECT id, task, completed FROM todo_tasks WHERE todo_list_id = $1",
            [todo_list_id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching tasks" });
    }
}

async function handleDeleteTask(req, res) {
    try {
        const { task_id } = req.body;
        if (!task_id) {
            return res.status(400).json({ message: "Missing task_id" });
        }

        await pool.query("DELETE FROM todo_tasks WHERE id = $1", [task_id]);

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while deleting task" });
    }
}

module.exports = {
    handleAddTask,
    handleCompleteTask,
    handleGetTasks,
    handleDeleteTask
};
