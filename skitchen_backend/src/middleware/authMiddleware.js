const {User} = require('../models');
const jwt = require('jsonwebtoken');


async function authenticate(req, res, next){
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({success: false, message: 'Access token missing or malformed'});
        }

        const token = authHeader.split(' ')[1];
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({success: false, message: 'Invalid or expired token'});
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({success: false, message: 'User not found or removed'});
        }


        if (user.isActive === false) {
            return res.status(403).json({success: false, message: 'Account disabled, Contact admin'})
        }

        req.user = user;
        next();
        
    } catch (error) {
        console.error('Auth error', error.message);
        return res.status(403).json({success: false, message: 'Authentication failed'})
    }
}