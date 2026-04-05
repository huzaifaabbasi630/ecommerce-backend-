const { getFirestore } = require('../firebase');
const db = getFirestore();
const HOMEPAGE_DOC = 'homepage';

const DEFAULT_HOMEPAGE = {
  logo: null,
  hero: {
    headline: '',
    subheadline: '',
    backgroundImage: null,
    videoUrl: null,
    ctaText: '',
    ctaUrl: ''
  },
  sections: {
    about: {
      title: 'About us',
      content: ''
    },
    faq: [],
    privacy: {
      title: 'Privacy policy',
      content: ''
    },
    returns: {
      title: 'Returns policy',
      content: ''
    },
    shipping: {
      title: 'Shipping information',
      content: ''
    }
  },
  customCode: '',
  updatedAt: null
};

async function getHomepage(req, res) {
  try {
    const homepageRef = db.collection('admin').doc(HOMEPAGE_DOC);
    const snapshot = await homepageRef.get();

    if (!snapshot.exists) {
      return res.json(DEFAULT_HOMEPAGE);
    }

    res.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    console.error('[Get homepage error]', error);
    res.status(500).json({ error: 'Unable to fetch homepage configuration.' });
  }
}

async function updateHomepage(req, res) {
  try {
    const payload = req.body;

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Request body must include homepage fields to update.' });
    }

    const homepageRef = db.collection('admin').doc(HOMEPAGE_DOC);
    const cleanPayload = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    await homepageRef.set(cleanPayload, { merge: true });

    const updated = await homepageRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('[Update homepage error]', error);
    res.status(500).json({ error: 'Unable to update homepage data.' });
  }
}

module.exports = {
  getHomepage,
  updateHomepage
};
