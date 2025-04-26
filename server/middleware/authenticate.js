// server/middleware/authenticate.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  // Expect header of form "Bearer <token>"
  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Malformed Authorization header' });
  }

  try {
    // use the same secret you sign with in signup/login
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = { id: payload.id, email: payload.email };  
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
