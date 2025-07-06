import { auth } from "../config/firebase.js";
import User from "../models/User.js";

const adminAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token found' });
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Find user in database and check admin status
    const user = await User.findOne({ firebaseUid: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

export default adminAuth;
