const express = require('express');
const router = express.Router();
const {
    addColumn,
    updateColumn,
    getUserColumns,
    deleteColumn,
    handleUpdateColumnLayoutWidget,
    handleAddColumnLayoutWidget,
    handleGetColumnLayoutWidgets,
    handleDeleteColumnLayoutWidget
} = require('../controllers/columnsController');


router.get('/', getUserColumns);
router.post('/', addColumn);
router.put('up/:id', updateColumn);
router.delete('up/:id', deleteColumn);

router.post("/add", handleAddColumnLayoutWidget);


router.put("/update", handleUpdateColumnLayoutWidget);

// Delete widget
router.delete("/delete", handleDeleteColumnLayoutWidget);

router.get("/all", handleGetColumnLayoutWidgets);

module.exports = router;
