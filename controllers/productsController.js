const { getFirestore } = require('../firebase');
const db = getFirestore();

async function getAllProducts(req, res) {
  try {
    const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ products });
  } catch (error) {
    console.error('[Get products error]', error);
    res.status(500).json({ error: 'Unable to fetch products.' });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('[Get product error]', error);
    res.status(500).json({ error: 'Unable to fetch product.' });
  }
}

async function addProduct(req, res) {
  try {
    const product = req.body;
    if (!product.name || !product.price) {
      return res.status(400).json({ error: 'Product name and price are required.' });
    }

    const newProduct = {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('products').add(newProduct);
    const snapshot = await docRef.get();
    res.status(201).json({ id: docRef.id, ...snapshot.data() });
  } catch (error) {
    console.error('[Add product error]', error);
    res.status(500).json({ error: 'Unable to add product.' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await docRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('[Update product error]', error);
    res.status(500).json({ error: 'Unable to update product.' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const docRef = db.collection('products').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[Delete product error]', error);
    res.status(500).json({ error: 'Unable to delete product.' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};
