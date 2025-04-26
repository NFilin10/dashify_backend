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

async function getUserColumns(req, res) {
    try {
        const userId = extractUserId(req);
        const result = await pool.query(
            `SELECT * FROM columns WHERE user_id = $1 ORDER BY position`,
            [userId]
        );

        let columns = result.rows;

        if (columns.length === 0) {
            const inserts = await Promise.all(
                [1, 2, 3].map(pos =>
                    pool.query(
                        `INSERT INTO columns (user_id, position, width) 
                         VALUES ($1, $2, $3) RETURNING *`,
                        [userId, pos, 100 / 3]
                    )
                )
            );
            columns = inserts.flatMap(r => r.rows);
        }

        res.json({ success: true, columns });
    } catch (error) {
        console.error("Error fetching columns:", error.stack);
        const status = error.message.includes("token") ? 401 : 500;
        res.status(status).json({ success: false, error: error.message });
    }
}

async function addColumn(req, res) {
    try {
        const userId = extractUserId(req);
        const { position, width } = req.body;

        const result = await pool.query(
            `INSERT INTO columns (user_id, position, width) 
             VALUES ($1, $2, $3) RETURNING *`,
            [userId, position, width]
        );

        res.json({ success: true, column: result.rows[0] });
    } catch (error) {
        console.error("Error adding column:", error.stack);
        const status = error.message.includes("token") ? 401 : 500;
        res.status(status).json({ success: false, error: error.message });
    }
}

async function updateColumn(req, res) {
    try {
        const { id } = req.params;
        const { width, position } = req.body;

        await pool.query(
            `UPDATE columns 
             SET width = $1, position = $2 
             WHERE id = $3`,
            [width, position, id]
        );

        res.json({ success: true, message: "Column updated" });
    } catch (error) {
        console.error("Error updating column:", error.stack);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteColumn(req, res) {
    try {
        const { id } = req.params;

        await pool.query(`DELETE FROM column_widgets WHERE column_id = $1`, [id]);
        await pool.query(`DELETE FROM columns WHERE id = $1`, [id]);

        res.json({ success: true, message: "Column deleted" });
    } catch (error) {
        console.error("Error deleting column:", error.stack);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function handleAddColumnLayoutWidget(req, res) {
    try {
        const { type, column_id, position } = req.body;

        if (!type || !column_id || position == null) {
            return res.status(400).json({ message: "Missing type, column_id or position" });
        }

        const userId = extractUserId(req);

        const result = await pool.query(
            `INSERT INTO widgets (widget_type, user_id)
             VALUES ($1, $2)
             RETURNING id`,
            [type, userId]
        );

        const widgetId = result.rows[0].id;

        await pool.query(
            `INSERT INTO column_widgets (column_id, widget_id, position)
             VALUES ($1, $2, $3)`,
            [column_id, widgetId, position]
        );

        if (type === "todoList") {
            await pool.query("INSERT INTO todo_widget (widget_id) VALUES ($1)", [widgetId]);
        } else if (type === "weather") {
            await pool.query("INSERT INTO weather_widget (widget_id) VALUES ($1)", [widgetId]);
        } else if (type === "note") {
            await pool.query("INSERT INTO note_widget (widget_id) VALUES ($1)", [widgetId]);
        } else if (type === "customLinks") {
            await pool.query("INSERT INTO custom_link_widget (widget_id) VALUES ($1)", [widgetId]);
        } else if (type === "imageCarousel") {
            await pool.query("INSERT INTO image_carousel_widget (widget_id) VALUES ($1)", [widgetId]);
        }

        res.status(201).json({ message: "Widget added to column successfully", widgetId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while adding widget to column" });
    }
}

async function handleUpdateColumnLayoutWidget(req, res) {
    try {
        const { widget_id, new_column_id, new_position } = req.body;

        if (!widget_id || !new_column_id || new_position == null) {
            return res.status(400).json({ message: "Missing widget_id, column_id, or position" });
        }

        await pool.query(
            `UPDATE column_widgets
             SET column_id = $1, position = $2
             WHERE widget_id = $3`,
            [new_column_id, new_position, widget_id]
        );

        res.status(200).json({ message: "Widget position updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while updating widget position" });
    }
}


async function handleDeleteColumnLayoutWidget(req, res) {
    try {
        const { widget_id } = req.body;
        const userId = extractUserId(req);

        if (!widget_id) {
            return res.status(400).json({ message: "Missing widget_id" });
        }

        await pool.query(
            `DELETE FROM column_widgets WHERE widget_id = $1`,
            [widget_id]
        );

        await pool.query(
            `DELETE FROM widgets WHERE id = $1 AND user_id = $2`,
            [widget_id, userId]
        );

        res.status(200).json({ message: "Widget deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while deleting widget" });
    }
}

async function handleGetColumnLayoutWidgets(req, res) {
    try {
        const userId = extractUserId(req);

        const result = await pool.query(`
            SELECT cw.id, cw.column_id, cw.position, cw.widget_id, clw.widget_type
            FROM column_widgets cw
            JOIN widgets clw ON cw.widget_id = clw.id
            WHERE clw.user_id = $1
            ORDER BY cw.column_id, cw.position ASC
        `, [userId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching widgets" });
    }
}


module.exports = {
    getUserColumns,
    addColumn,
    updateColumn,
    deleteColumn,
    handleDeleteColumnLayoutWidget,
    handleGetColumnLayoutWidgets,
    handleAddColumnLayoutWidget,
    handleUpdateColumnLayoutWidget
};
