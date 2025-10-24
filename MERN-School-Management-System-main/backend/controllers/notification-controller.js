const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, asyncHandler } = require('../utils/responseHelper');
const Notification = require('../models/notificationSchema');

// Get notifications for current user
const getNotifications = asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { type, priority, read } = req.query;

    try {
        // Build filter
        let filter = {
            'recipient.user': userId,
            'recipient.userType': role,
            expiresAt: { $gt: new Date() }
        };

        if (type) filter.type = type;
        if (priority) filter.priority = priority;
        if (read !== undefined) filter.read = read === 'true';

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments(filter);

        sendPaginatedResponse(res, notifications, page, limit, total, 'Notifications retrieved successfully');
    } catch (error) {
        console.error('Get notifications error:', error);
        sendErrorResponse(res, 500, 'Failed to retrieve notifications');
    }
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const { id: userId, role } = req.user;

    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                'recipient.user': userId,
                'recipient.userType': role
            },
            {
                read: true,
                readAt: new Date()
            },
            { new: true }
        );

        if (!notification) {
            return sendErrorResponse(res, 404, 'Notification not found');
        }

        sendSuccessResponse(res, 200, 'Notification marked as read', notification);
    } catch (error) {
        console.error('Mark notification as read error:', error);
        sendErrorResponse(res, 500, 'Failed to mark notification as read');
    }
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;

    try {
        const result = await Notification.markAllAsRead(userId, role);
        
        sendSuccessResponse(res, 200, 'All notifications marked as read', {
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        sendErrorResponse(res, 500, 'Failed to mark all notifications as read');
    }
});

// Get unread notification count
const getUnreadCount = asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;

    try {
        const count = await Notification.getUnreadCount(userId, role);
        
        sendSuccessResponse(res, 200, 'Unread count retrieved successfully', {
            unreadCount: count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        sendErrorResponse(res, 500, 'Failed to get unread count');
    }
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const { id: userId, role } = req.user;

    try {
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            'recipient.user': userId,
            'recipient.userType': role
        });

        if (!notification) {
            return sendErrorResponse(res, 404, 'Notification not found');
        }

        sendSuccessResponse(res, 200, 'Notification deleted successfully');
    } catch (error) {
        console.error('Delete notification error:', error);
        sendErrorResponse(res, 500, 'Failed to delete notification');
    }
});

// Create notification (Admin only)
const createNotification = asyncHandler(async (req, res) => {
    const { role, id: senderId, name: senderName, schoolId } = req.user;
    const { recipientId, recipientType, title, message, type, priority, actionUrl, actionData } = req.body;

    try {
        // Only admins can create arbitrary notifications
        if (role !== 'admin') {
            return sendErrorResponse(res, 403, 'Only administrators can create notifications');
        }

        const notification = await Notification.createNotification({
            recipient: {
                user: recipientId,
                userType: recipientType
            },
            sender: {
                user: senderId,
                userType: role,
                name: senderName
            },
            title,
            message,
            type,
            priority,
            actionUrl,
            actionData,
            school: schoolId
        });

        sendSuccessResponse(res, 201, 'Notification created successfully', notification);
    } catch (error) {
        console.error('Create notification error:', error);
        sendErrorResponse(res, 500, 'Failed to create notification');
    }
});

// Broadcast notification to multiple recipients (Admin only)
const broadcastNotification = asyncHandler(async (req, res) => {
    const { role, id: senderId, name: senderName, schoolId } = req.user;
    const { recipients, title, message, type, priority, actionUrl, actionData } = req.body;

    try {
        // Only admins can broadcast notifications
        if (role !== 'admin') {
            return sendErrorResponse(res, 403, 'Only administrators can broadcast notifications');
        }

        if (!recipients || recipients.length === 0) {
            return sendErrorResponse(res, 400, 'Recipients list is required');
        }

        // Create notifications for all recipients
        const notifications = await Promise.all(
            recipients.map(recipient => 
                Notification.createNotification({
                    recipient: {
                        user: recipient.userId,
                        userType: recipient.userType
                    },
                    sender: {
                        user: senderId,
                        userType: role,
                        name: senderName
                    },
                    title,
                    message,
                    type,
                    priority,
                    actionUrl,
                    actionData,
                    school: schoolId
                })
            )
        );

        sendSuccessResponse(res, 201, 'Notifications broadcasted successfully', {
            count: notifications.length,
            notifications
        });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        sendErrorResponse(res, 500, 'Failed to broadcast notifications');
    }
});

// Get notification statistics (Admin only)
const getNotificationStats = asyncHandler(async (req, res) => {
    const { role, schoolId } = req.user;

    try {
        if (role !== 'admin') {
            return sendErrorResponse(res, 403, 'Only administrators can view notification statistics');
        }

        const stats = await Notification.aggregate([
            { 
                $match: { 
                    school: schoolId,
                    createdAt: { 
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
                    }
                } 
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    readCount: { 
                        $sum: { $cond: ['$read', 1, 0] } 
                    },
                    unreadCount: { 
                        $sum: { $cond: ['$read', 0, 1] } 
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const priorityStats = await Notification.aggregate([
            { $match: { school: schoolId } },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        sendSuccessResponse(res, 200, 'Notification statistics retrieved successfully', {
            typeStats: stats,
            priorityStats
        });
    } catch (error) {
        console.error('Get notification stats error:', error);
        sendErrorResponse(res, 500, 'Failed to retrieve notification statistics');
    }
});

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    createNotification,
    broadcastNotification,
    getNotificationStats
};