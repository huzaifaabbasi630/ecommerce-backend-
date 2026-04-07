const { getFirestore } = require('../firebase');
const db = getFirestore();

function validateOrderPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (!Array.isArray(payload.items) || payload.items.length === 0) return false;
  if (!payload.customerEmail || typeof payload.customerEmail !== 'string') return false;
  return true;
}

async function createOrder(req, res) {
  try {
    const order = req.body;

    if (!validateOrderPayload(order)) {
      return res.status(400).json({ error: 'Order payload must include customerEmail and an items array.' });
    }

    const newOrder = {
      customerEmail: order.customerEmail,
      customerName: order.customerName || null,
      items: order.items,
      shippingAddress: order.shippingAddress || null,
      paymentMethod: order.paymentMethod || null,
      totalAmount: order.totalAmount || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const orderRef = await db.collection('orders').add(newOrder);
    const orderSnapshot = await orderRef.get();

    res.status(201).json({ id: orderRef.id, ...orderSnapshot.data() });
  } catch (err) {
  console.error("ORDER ERROR:", err); // 👈 ADD THIS
  res.status(500).json({
    error: "Unable to create order.",
    details: err.message // 👈 ADD THIS
  });
}
}

async function getAllOrders(req, res) {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ orders });
  } catch (error) {
    console.error('[Get orders error]', error);
    res.status(500).json({ error: 'Unable to fetch orders.' });
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const orderDoc = await db.collection('orders').doc(id).get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ id: orderDoc.id, ...orderDoc.data() });
  } catch (error) {
    console.error('[Get order by id error]', error);
    res.status(500).json({ error: 'Unable to fetch order.' });
  }
}

async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Request body must contain order fields to update.' });
    }

    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    await orderRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const updated = await orderRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('[Update order error]', error);
    res.status(500).json({ error: 'Unable to update order.' });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder
};
