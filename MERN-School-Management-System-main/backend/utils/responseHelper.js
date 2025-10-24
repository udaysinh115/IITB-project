/**
 * Send successful response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {any} data - Response data
 */
const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = null) => {
    const response = {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} errors - Detailed errors
 */
const sendErrorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
    const response = {
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Response} res - Express response object
 * @param {Array} data - Response data
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @param {string} message - Success message
 */
const sendPaginatedResponse = (res, data, page, limit, total, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    const response = {
        success: true,
        message,
        data,
        pagination: {
            current: page,
            pages: totalPages,
            count: data.length,
            total,
            hasNext,
            hasPrev,
            next: hasNext ? page + 1 : null,
            prev: hasPrev ? page - 1 : null
        },
        timestamp: new Date().toISOString()
    };
    
    return res.status(200).json(response);
};

/**
 * Handle async errors in controllers
 * @param {Function} fn - Async function
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler middleware
 */
const globalErrorHandler = (err, req, res, next) => {
    console.error('Error Stack:', err.stack);
    
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = null;
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(err.errors).map(e => e.message);
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value';
        const field = Object.keys(err.keyPattern)[0];
        errors = [`${field} already exists`];
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    
    sendErrorResponse(res, statusCode, message, errors);
};

module.exports = {
    sendSuccessResponse,
    sendErrorResponse,
    sendPaginatedResponse,
    asyncHandler,
    globalErrorHandler
};