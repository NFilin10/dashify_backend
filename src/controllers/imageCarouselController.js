const pool = require('../database');
const fs = require('fs');
const path = require('path');

async function uploadCarouselImage(req, res) {
    try {
        const { widgetId } = req.body;

        if (!req.file || !widgetId) {
            return res.status(400).json({ success: false, error: "Missing file or widgetId" });
        }

        const imagePath = "uploads/" + req.file.filename;
        await pool.query(`
            INSERT INTO images (image_carousel_id, image_path)
            VALUES ($1, $2)
        `, [widgetId, imagePath]);

        res.json({ success: true, imagePath });
    } catch (error) {
        console.error("Error uploading carousel image:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getCarouselImages(req, res) {
    try {
        const { widgetId } = req.query;
        if (!widgetId) {
            return res.status(400).json({ success: false, error: "Missing widgetId" });
        }

        const result = await pool.query(`
            SELECT id, image_path
            FROM images
            WHERE image_carousel_id = $1
        `, [widgetId]);

        res.json({ success: true, images: result.rows });
    } catch (error) {
        console.error("Error fetching carousel images:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteCarouselImage(req, res) {
    try {
        const { imageId } = req.body;
        if (!imageId) {
            return res.status(400).json({ success: false, error: "Missing imageId" });
        }

        const imageResult = await pool.query(`
            SELECT image_path FROM images WHERE id = $1
        `, [imageId]);

        const imagePath = imageResult.rows[0]?.image_path;
        if (imagePath) {
            const fullPath = path.join(__dirname, "..", imagePath);
            fs.unlinkSync(fullPath);
        }

        await pool.query(`DELETE FROM images WHERE id = $1`, [imageId]);
        res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting carousel image:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    uploadCarouselImage,
    getCarouselImages,
    deleteCarouselImage
};
