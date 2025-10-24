const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { sendErrorResponse } = require('../utils/responseHelper');

// Rate limiting configurations
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        error: 'Too many requests, please try again later.'
    }
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: {
        error: 'Too many requests for this action, please try again later.'
    }
});

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, 'Validation failed', errors.array());
    }
    next();
};

// Common validation rules
const validateEmail = body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address');

const validatePassword = body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

const validateName = body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces');

const validateRollNum = body('rollNum')
    .isInt({ min: 1 })
    .withMessage('Roll number must be a positive integer');

const validatePhone = body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number');

const validateDate = (field) => body(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} must be a valid date`);

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Remove potentially harmful characters
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                 .replace(/javascript:/gi, '')
                 .replace(/on\w+\s*=/gi, '');
    };
    
    const sanitizeObject = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = sanitizeString(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObject(obj[key]);
            }
        }
    };
    
    if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
    }
    
    next();
};

module.exports = {
    authLimiter,
    generalLimiter,
    strictLimiter,
    handleValidationErrors,
    validateEmail,
    validatePassword,
    validateName,
    validateRollNum,
    validatePhone,
    validateDate,
    sanitizeInput
};