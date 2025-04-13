const pool = require("../database");
const jwt = require("jsonwebtoken");
const fs = require('fs');

const secret = process.env.SECRET;
const path = require('path');


const extractUserIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded.id;
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
};


const saveLayoutSettings = async (userId, theme, color) => {
    const query = `
        UPDATE layout_settings
        SET theme = $2, color = $3
        WHERE user_id = $1
        RETURNING *;
    `;
    const values = [userId, theme, color];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to save settings: ' + error.stack);
    }
};


const handleSaveLayoutSettings = async (req, res) => {
    const { theme, color } = req.body;

    const token = req.cookies.jwt

    if (!token) {
        return res.status(401).json({ success: false, error: "No token provided" });
    }

    try {
        const userId = extractUserIdFromToken(token);
        const savedSettings = await saveLayoutSettings(userId, theme, color);
        res.json({ success: true, settings: savedSettings });
    } catch (error) {
        console.error('Error saving layout settings:', error.stack);
        res.status(500).json({ success: false, error: error.message });
    }
};


const getLayoutSettings = async (userId) => {
    const query = `
        SELECT theme, color, image_path 
        FROM layout_settings
        WHERE user_id = $1;
    `;
    const values = [userId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to fetch settings: ' + error.stack);
    }
};


const handleGetLayoutSettings = async (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ success: false, error: "No token provided" });
    }

    try {
        const userId = extractUserIdFromToken(token);

        const settings = await getLayoutSettings(userId);

        if (!settings) {
            return res.status(404).json({ success: false, error: "Settings not found" });
        }

        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching layout settings:', error.stack);
        res.status(500).json({ success: false, error: error.message });
    }
};

const handleUploadImage = async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ success: false, error: "No token provided" });
    }

    try {
        const userId = extractUserIdFromToken(token);

        if (!req.file) {
            return res.status(400).json({ success: false, error: "No image file uploaded" });
        }

        const filePath = "uploads/" + req.file.filename

        const query = `
            UPDATE layout_settings
            SET image_path = $2
            WHERE user_id = $1
            RETURNING *;
        `;
        const values = [userId, filePath];

        const result = await pool.query(query, values);

        res.json({
            success: true,
            settings: result.rows[0],
            imagePath: filePath,
        });
    } catch (error) {
        console.error("Error uploading image:", error.stack);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteImage = async (userId) => {
    const query = `
        SELECT image_path
        FROM layout_settings
        WHERE user_id = $1;
    `;
    const values = [userId];

    try {
        const result = await pool.query(query, values);

        if (result.rows.length === 0 || !result.rows[0].image_path) {
            throw new Error("No image to delete");
        }

        const imagePath = result.rows[0].image_path;
        const fullImagePath = path.join(__dirname, '..', imagePath);

        fs.unlinkSync(fullImagePath);

        const updateQuery = `
            UPDATE layout_settings
            SET image_path = NULL
            WHERE user_id = $1
            RETURNING *;
        `;
        const updateValues = [userId];

        const updatedResult = await pool.query(updateQuery, updateValues);

        return updatedResult.rows[0];
    } catch (error) {
        throw new Error('Failed to delete image: ' + error.message);
    }
};


const handleDeleteImage = async (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ success: false, error: "No token provided" });
    }

    try {
        const userId = extractUserIdFromToken(token);

        const updatedSettings = await deleteImage(userId);

        res.json({
            success: true,
            settings: updatedSettings,
            message: "Image successfully deleted",
        });
    } catch (error) {
        console.error('Error deleting image:', error.stack);
        res.status(500).json({ success: false, error: error.message });
    }
};



module.exports = {
    handleGetLayoutSettings,
    handleSaveLayoutSettings,
    handleUploadImage,
    handleDeleteImage
};
