const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { createOrder, getAllOrders, getOrderById, updateOrder, sendOrderEmail } = require('../controllers/ordersController');

const router = express.Router();

router.post('/', createOrder);
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.get('/:id', authenticateToken, requireAdmin, getOrderById);
router.put('/:id', authenticateToken, requireAdmin, updateOrder);
router.post('/:id/send-email', authenticateToken, requireAdmin, sendOrderEmail);

module.exports = router;
