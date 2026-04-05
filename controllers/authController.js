const { getFirestore, getAuth, ensureAdminUser } = require('../firebase');

const db = getFirestore();
const auth = getAuth();
const API_KEY = process.env.FIREBASE_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const FIREBASE_AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1/accounts';

function validateEmail(email) {
  return typeof email === 'string' && email.includes('@');
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

async function signup(req, res) {
  try {
    const { email, password, displayName } = req.body;

    if (!validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ error: 'A valid email and a password with at least 6 characters are required.' });
    }

    const response = await fetch(`${FIREBASE_AUTH_BASE}:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: result.error?.message || 'Signup failed.' });
    }

    await db.collection('users').doc(result.localId).set({
      email,
      displayName: displayName || null,
      role: 'user',
      createdAt: new Date().toISOString()
    }, { merge: true });

    res.status(201).json({
      uid: result.localId,
      email: result.email,
      token: result.idToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('[Signup error]', error);
    res.status(500).json({ error: 'Could not create user.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ error: 'A valid email and password are required for login.' });
    }

    const response = await fetch(`${FIREBASE_AUTH_BASE}:signInWithPassword?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(401).json({ error: result.error?.message || 'Login failed.' });
    }

    res.json({
      uid: result.localId,
      email: result.email,
      token: result.idToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('[Login error]', error);
    res.status(500).json({ error: 'Login request failed.' });
  }
}

async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ error: 'A valid email and password are required.' });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    await ensureAdminUser();

    const response = await fetch(`${FIREBASE_AUTH_BASE}:signInWithPassword?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(401).json({ error: result.error?.message || 'Admin login failed.' });
    }

    res.json({
      admin: true,
      uid: result.localId,
      email: result.email,
      token: result.idToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('[Admin login error]', error);
    res.status(500).json({ error: 'Admin login failed.' });
  }
}

module.exports = {
  signup,
  login,
  adminLogin
};
