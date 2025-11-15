import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Authenticate user via JWT token
 * Optionally restrict access by roles
 * @param  {...string} allowedRoles - roles that are allowed to access this route
 */
function authenticate(...allowedRoles) {
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access token missing or malformed' });
      }

      const token = authHeader.split(' ')[1];

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or removed' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account disabled, contact admin' });
      }

      // Attach user to request
      req.user = user;

      // Check role if allowedRoles are provided
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Auth error', error.message);
      return res.status(403).json({ success: false, message: 'Authentication failed' });
    }
  }; 
}

export default authenticate;
