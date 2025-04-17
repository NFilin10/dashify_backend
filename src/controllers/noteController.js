const pool = require("../database");

async function handleSaveNote(req, res) {
    try {
        const {widget_id, note} = req.body;

        if (!widget_id || note === undefined) {
            return res.status(400).json({message: "Missing widget_id or note"});
        }

        const noteWidgetData = await pool.query(
            "SELECT id FROM notes WHERE note_widget_id = $1",
            [widget_id]
        );


        if (noteWidgetData.rows.length > 0) {


            await pool.query(
                "UPDATE notes SET note = $1 WHERE note_widget_id = $2",
                [note, widget_id]
            );
        } else {

            await pool.query(
                "INSERT INTO notes (note_widget_id, note) VALUES ($1, $2) RETURNING id",
                [widget_id, note]
            );

        }

        res.status(200).json({message: "Note saved successfully"});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error while saving note"});
    }
}

async function handleGetNoteForWidget(req, res) {
    try {
        const { widget_id } = req.query;
        if (!widget_id) {
            return res.status(400).json({ message: "Missing widget_id" });
        }


        const noteResult = await pool.query(
            "SELECT note FROM notes WHERE note_widget_id = $1",
            [widget_id]
        );

        if (noteResult.rows.length === 0) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json({ note: noteResult.rows[0].note });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching note" });
    }
}

module.exports = {
    handleSaveNote,
    handleGetNoteForWidget
};
