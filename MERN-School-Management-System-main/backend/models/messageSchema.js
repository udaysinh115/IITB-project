const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'conversation',
        required: true
    },
    sender: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'sender.userType'
        },
        userType: {
            type: String,
            required: true,
            enum: ['admin', 'teacher', 'student', 'parent']
        },
        name: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        }
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'file', 'image', 'notification'],
        default: 'text'
    },
    attachments: [{
        name: String,
        url: String,
        size: Number,
        type: String
    }],
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'readBy.userType'
        },
        userType: {
            type: String,
            enum: ['admin', 'teacher', 'student', 'parent']
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, { timestamps: true });

// Indexes for efficient querying
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ 'sender.user': 1 });
messageSchema.index({ 'readBy.user': 1 });

// Methods
messageSchema.methods.markAsRead = function(userId, userType) {
    if (!this.readBy.some(r => r.user.toString() === userId.toString())) {
        this.readBy.push({ user: userId, userType, readAt: new Date() });
    }
};

messageSchema.methods.isReadBy = function(userId) {
    return this.readBy.some(r => r.user.toString() === userId.toString());
};

messageSchema.methods.softDelete = function() {
    this.deleted = true;
    this.deletedAt = new Date();
};

module.exports = mongoose.model("message", messageSchema);