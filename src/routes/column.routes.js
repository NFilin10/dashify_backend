const express = require('express');
const router = express.Router();
const authenticateMiddleware = require('./../middlewares/auth.middleware');

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


router.get('/get-columns', authenticateMiddleware, getUserColumns);
router.post('/add-column', authenticateMiddleware, addColumn);
router.put('/update-column/:id', authenticateMiddleware, updateColumn);
router.delete('/delete-column/:id', authenticateMiddleware, deleteColumn);


router.post("/add-widget", authenticateMiddleware, handleAddColumnLayoutWidget);
router.put("/update-pos", authenticateMiddleware, handleUpdateColumnLayoutWidget);
router.delete("/delete-widget", authenticateMiddleware, handleDeleteColumnLayoutWidget);
router.get("/widgets/column-widgets", authenticateMiddleware, handleGetColumnLayoutWidgets);

module.exports = router;
