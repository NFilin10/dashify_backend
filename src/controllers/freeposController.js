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
        } else if (widget_type === "customLinks") {
            await pool.query("INSERT INTO custom_link_widget (widget_id) VALUES ($1)", [widgetId]);
        } else if (widget_type === "imageCarousel") {
            await pool.query("INSERT INTO image_carousel_widget (widget_id) VALUES ($1)", [widgetId]);
        }

        res.status(201).json({ message: "Widget created successfully", widgetId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while creating widget" });
    }
}

async function handleAddWidgetPosition(req, res) {
    try {
        const { x, y, widget_id } = req.body;
        const userId = extractUserId(req);


        if (x == null || y == null || !widget_id) {
            return res.status(400).json({ message: "Missing x, y, or widget_id" });
        }

        await pool.query(
            "INSERT INTO freepos_widgets (x, y, widget_id, user_id) VALUES ($1, $2, $3, $4)",
            [x, y, widget_id, userId]
        );

        res.status(201).json({ message: "Widget position added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while adding widget position" });
    }
}

async function handleUpdateWidgetPosition(req, res) {
    try {
        const { widget_id, x, y } = req.body;

        if (!widget_id || x == null || y == null) {
            return res.status(400).json({ message: "Missing widget_id, x, or y" });
        }

        await pool.query(
            "UPDATE freepos_widgets SET x = $1, y = $2 WHERE widget_id = $3",
            [x, y, widget_id]
        );

        res.status(200).json({ message: "Widget position updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while updating widget position" });
    }
}

async function handleGetWidgetPositions(req, res) {
    try {
        const userId = extractUserId(req);

        const result = await pool.query(
            `SELECT fw.id, fw.x, fw.y, fw.widget_id, w.widget_type
             FROM freepos_widgets fw
             JOIN widgets w ON fw.widget_id = w.id
             WHERE w.user_id = $1`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching widget positions" });
    }
}


async function handleDeleteWidgetPosition(req, res) {
    try {
        const { widget_id } = req.body;

        if (!widget_id) {
            return res.status(400).json({ message: "Missing widget_id" });
        }

        await pool.query(
            "DELETE FROM freepos_widgets WHERE widget_id = $1",
            [widget_id]
        );

        const userId = extractUserId(req);


        await pool.query(
            "DELETE FROM widgets WHERE id = $1 and user_id = $2",
            [widget_id, userId]
        );

        res.status(200).json({ message: "Widget position deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while deleting widget position" });
    }
}

module.exports = {
    handleAddWidgetPosition,
    handleUpdateWidgetPosition,
    handleGetWidgetPositions,
    handleDeleteWidgetPosition,
    handleAddWidget
};
