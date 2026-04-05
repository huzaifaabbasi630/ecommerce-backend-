const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { createOrder, getAllOrders, getOrderById, updateOrder } = require('../controllers/ordersController');

const router = express.Router();

router.post('/', createOrder);
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.get('/:id', authenticateToken, requireAdmin, getOrderById);
router.put('/:id', authenticateToken, requireAdmin, updateOrder);

module.exports = router;
