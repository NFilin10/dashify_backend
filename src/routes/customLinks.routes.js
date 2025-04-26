const express = require('express');
const router = express.Router();
const {getLinks, addLink, deleteLink} = require('../controllers/customLinksController');

router.get('/get-link', getLinks);
router.post('/add-link', addLink);
router.delete('/delete-link', deleteLink);

module.exports = router;
