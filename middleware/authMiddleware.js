const { getAuth } = require('../firebase');

const auth = getAuth();

async function authenticateToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed.' });
  }

  const idToken = authorizationHeader.split(' ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('[Firebase auth verify failed]', error);
    res.status(401).json({ error: 'Token verification failed. Please login again.' });
  }
}

function requireAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized request.' });
  }

  if (req.user.email !== adminEmail && req.user.admin !== true) {
    return res.status(403).json({ error: 'Admin privileges are required to access this resource.' });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
};
