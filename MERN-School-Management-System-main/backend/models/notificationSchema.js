const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'recipient.userType'
        },
        userType: {
            type: String,
            required: true,
            enum: ['admin', 'teacher', 'student', 'parent']
        }
    },
    sender: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'sender.userType'
        },
        userType: {
            type: String,
            enum: ['admin', 'teacher', 'student', 'parent', 'system']
        },
        name: {
            type: String
        }
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: [
            'grade_update',
            'attendance_alert',
            'exam_schedule',
            'complaint_update',
            'message_received',
            'fee_reminder',
            'system_update',
            'announcement',
            'parent_meeting',
            'general'
        ],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    actionUrl: {
        type: String,
        default: null
    },
    actionData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ 'recipient.user': 1, createdAt: -1 });
notificationSchema.index({ read: 1, expiresAt: 1 });
notificationSchema.index({ type: 1, priority: 1 });

// TTL index to automatically delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
notificationSchema.methods.markAsRead = function() {
    this.read = true;
    this.readAt = new Date();
};

notificationSchema.methods.isExpired = function() {
    return this.expiresAt && this.expiresAt < new Date();
};

// Static methods
notificationSchema.statics.markAllAsRead = async function(userId, userType) {
    return await this.updateMany(
        { 
            'recipient.user': userId, 
            'recipient.userType': userType,
            read: false 
        },
        { 
            read: true, 
            readAt: new Date() 
        }
    );
};

notificationSchema.statics.getUnreadCount = async function(userId, userType) {
    return await this.countDocuments({
        'recipient.user': userId,
        'recipient.userType': userType,
        read: false,
        expiresAt: { $gt: new Date() }
    });
};

notificationSchema.statics.createNotification = async function(data) {
    const notification = new this(data);
    return await notification.save();
};

module.exports = mongoose.model('notification', notificationSchema);