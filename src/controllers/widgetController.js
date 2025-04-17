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

async function handleAddWidget(req, res) {
    try {
        const { widget_type } = req.body;

        if (!widget_type) {
            return res.status(400).json({ message: "Missing widget_type" });
        }

        const userId = extractUserId(req);

        const result = await pool.query(
            "INSERT INTO widgets (widget_type, user_id) VALUES ($1, $2) RETURNING id",
            [widget_type, userId]
        );

        const widgetId = result.rows[0].id;

        if (widget_type === "todoList") {
            await pool.query("INSERT INTO todo_widget (widget_id) VALUES ($1)", [widgetId]);
        } else if (widget_type === "weather") {
            await pool.query("INSERT INTO weather_widget (widget_id) VALUES ($1)", [widgetId]);
        } else if (widget_type === "note") {
            await pool.query("INSERT INTO note_widget (widget_id) VALUES ($1)", [widgetId]);
        }

        res.status(201).json({ message: "Widget created successfully", widgetId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while creating widget" });
    }
}

module.exports = {
    handleAddWidget
};
