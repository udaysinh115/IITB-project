const { verifyToken, getTokenFromHeader } = require('../config/jwt');
const { sendErrorResponse } = require('../utils/responseHelper');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = getTokenFromHeader(authHeader);
        
        if (!token) {
            return sendErrorResponse(res, 401, 'Access denied. No token provided.');
        }
        
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return sendErrorResponse(res, 401, 'Invalid token.');
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendErrorResponse(res, 401, 'Access denied. User not authenticated.');
        }
        
        if (!roles.includes(req.user.role)) {
            return sendErrorResponse(res, 403, 'Access denied. Insufficient permissions.');
        }
        
        next();
    };
};

const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = getTokenFromHeader(authHeader);
        
        if (token) {
            const decoded = verifyToken(token);
            req.user = decoded;
        }
        
        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuth
};