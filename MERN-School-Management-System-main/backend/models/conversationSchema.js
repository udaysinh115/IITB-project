const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'participants.userType'
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
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    type: {
        type: String,
        enum: ['direct', 'group', 'complaint'],
        default: 'direct'
    },
    subject: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient querying
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ lastMessageAt: -1 });

conversationSchema.methods.addParticipant = function(userId, userType, name, role) {
    if (!this.participants.some(p => p.user.toString() === userId.toString())) {
        this.participants.push({ user: userId, userType, name, role });
    }
};

conversationSchema.methods.removeParticipant = function(userId) {
    this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
};

conversationSchema.methods.updateLastMessage = function(messageId) {
    this.lastMessage = messageId;
    this.lastMessageAt = new Date();
};

module.exports = mongoose.model('conversation', conversationSchema);