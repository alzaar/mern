const express = require('express');
const router = express.Router();

// @route testing for profile
// /api/profile/test
//@get request with private access
router.get('/test', (req, res) => res.status(200).json({msg: 'this is profile'}));

module.exports = router;
