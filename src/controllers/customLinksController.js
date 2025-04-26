const pool = require('../database');


async function addLink(req, res) {
    try {
        const { custom_link_id, link } = req.body;
        if (!custom_link_id || !link) {
            return res.status(400).json({ message: "Missing custom_link_id or note" });
        }

        await pool.query(
            "INSERT INTO links (custom_link_id, link) VALUES ($1, $2)",
            [custom_link_id, link]
        );

        res.status(201).json({ message: "Link added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while adding task" });
    }
}

async function getLinks(req, res) {
    try {
        const { custom_link_id } = req.query;
        if (!custom_link_id) {
            return res.status(400).json({ message: "Missing custom_link_id" });
        }

        const result = await pool.query(
            "SELECT id, link FROM links WHERE custom_link_id = $1",
            [custom_link_id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching links" });
    }
}

async function deleteLink(req, res) {
    try {
        const { link_id } = req.body;
        if (!link_id) {
            return res.status(400).json({ message: "Missing link_id" });
        }

        await pool.query("DELETE FROM links WHERE id = $1", [link_id]);

        res.status(200).json({ message: "Link deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while deleting link" });
    }
}


module.exports = {
    getLinks,
    addLink,
    deleteLink
}