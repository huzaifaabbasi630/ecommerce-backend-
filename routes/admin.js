const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { getHomepage, updateHomepage } = require('../controllers/adminController');

const router = express.Router();

router.use(authenticateToken, requireAdmin);
router.get('/homepage', getHomepage);
router.put('/homepage', updateHomepage);

module.exports = router;
