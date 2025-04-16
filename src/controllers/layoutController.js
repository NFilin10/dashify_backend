const pool = require("../database");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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

async function saveLayoutSettings(userId, theme, color) {
    const result = await pool.query(`
        UPDATE layout_settings
        SET theme = $2, color = $3
        WHERE user_id = $1
        RETURNING *;
    `, [userId, theme, color]);
    return result.rows[0];
}

async function getLayoutSettings(userId) {
    const result = await pool.query(`
        SELECT theme, color, image_path
        FROM layout_settings
        WHERE user_id = $1;
    `, [userId]);
    return result.rows[0];
}

async function deleteImage(userId) {
    const selectQuery = `
        SELECT image_path FROM layout_settings WHERE user_id = $1;
    `;
    const result = await pool.query(selectQuery, [userId]);

    const imagePath = result.rows[0]?.image_path;
    if (!imagePath) {
        throw new Error("No image to delete");
    }

    const fullPath = path.join(__dirname, "..", imagePath);
    fs.unlinkSync(fullPath);

    const updatedResult = await pool.query(`
        UPDATE layout_settings
        SET image_path = NULL
        WHERE user_id = $1
        RETURNING *;
    `, [userId]);
    return updatedResult.rows[0];
}


async function handleSaveLayoutSettings(req, res) {
    try {
        const userId = extractUserId(req);
        const { theme, color } = req.body;
        const settings = await saveLayoutSettings(userId, theme, color);
        res.json({ success: true, settings });
    } catch (error) {
        console.error("Error saving layout settings:", error.stack);
        const status = error.message.includes("token") ? 401 : 500;
        res.status(status).json({ success: false, error: error.message });
    }
}

async function handleGetLayoutSettings(req, res) {
    try {
        const userId = extractUserId(req);
        const settings = await getLayoutSettings(userId);
        if (!settings) {
            return res.status(404).json({ success: false, error: "Settings not found" });
        }
        res.json({ success: true, settings });
    } catch (error) {
        console.error("Error fetching layout settings:", error.stack);
        const status = error.message.includes("token") ? 401 : 500;
        res.status(status).json({ success: false, error: error.message });
    }
}

async function handleUploadImage(req, res) {
    try {
        const userId = extractUserId(req);
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No image file uploaded" });
        }

        const filePath = "uploads/" + req.file.filename;
        const result = await pool.query(`
            UPDATE layout_settings
            SET image_path = $2
            WHERE user_id = $1
            RETURNING *;
        `, [userId, filePath]);

        res.json({
            success: true,
            settings: result.rows[0],
            imagePath: filePath,
        });
    } catch (error) {
        console.error("Error uploading image:", error.stack);
        const status = error.message.includes("token") ? 401 : 500;
        res.status(status).json({ success: false, error: error.message });
    }
}

async function handleDeleteImage(req, res) {
    try {
        const userId = extractUserId(req);
        const updatedSettings = await deleteImage(userId);
        res.json({
            success: true,
            settings: updatedSettings,
            message: "Image successfully deleted",
        });
    } catch (error) {
        console.error("Error deleting image:", error.stack);
        const status = error.message.includes("token") ? 401 : 500;
        res.status(status).json({ success: false, error: error.message });
    }
}

module.exports = {
    handleGetLayoutSettings,
    handleSaveLayoutSettings,
    handleUploadImage,
    handleDeleteImage,
};
