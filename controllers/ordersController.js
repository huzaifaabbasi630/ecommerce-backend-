const { getFirestore } = require('../firebase');
const { sendOrderConfirmation } = require('../utils/emailService');
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
    const createdOrder = { id: orderRef.id, ...orderSnapshot.data() };

    // Send initial confirmation email to user
    try {
      await sendOrderConfirmation(
        createdOrder.customerEmail,
        {
          customerName: createdOrder.customerName,
          address: createdOrder.shippingAddress?.address,
          phone: createdOrder.shippingAddress?.phone,
          postalCode: createdOrder.shippingAddress?.postalCode,
          items: createdOrder.items,
          totalAmount: createdOrder.totalAmount
        },
        'Not specified',
        'Pending'
      );
    } catch (emailErr) {
      console.error('[Initial email error]', emailErr);
      // Don't fail the order if email fails
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('[Create order error]', error);
    res.status(500).json({ error: 'Unable to create order.' });
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

async function sendOrderEmail(req, res) {
  try {
    const { orderId, deliveryDays, status } = req.body;

    if (!orderId || !deliveryDays || !status) {
      return res.status(400).json({ error: 'Missing orderId, deliveryDays, or status.' });
    }

    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const orderData = orderDoc.data();
    const result = await sendOrderConfirmation(
      orderData.customerEmail,
      {
        customerName: orderData.customerName,
        address: orderData.shippingAddress?.address,
        phone: orderData.shippingAddress?.phone,
        postalCode: orderData.shippingAddress?.postalCode,
        items: orderData.items,
        totalAmount: orderData.totalAmount
      },
      deliveryDays,
      status
    );

    if (result.success) {
      // Update order status in DB too
      await db.collection('orders').doc(orderId).update({
        status: status,
        deliveryDays: parseInt(deliveryDays),
        emailSentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('[Send email error]', error);
    res.status(500).json({ error: 'Unable to send email.' });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  sendOrderEmail
};
