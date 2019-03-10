const express = require('express');
const router = express.Router();

// @route testing for post 
// /api/post/test
//@get request with public access
router.get('/test', (req, res) => res.status(200).json({msg: 'this is post'}));

module.exports = router;
