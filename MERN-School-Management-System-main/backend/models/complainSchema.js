const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({
    complainant: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'complainant.userType'
        },
        userType: {
            type: String,
            required: true,
            enum: ['student', 'parent']
        },
        name: {
            type: String,
            required: true
        }
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: [
            'academic',
            'behavioral',
            'attendance',
            'homework',
            'communication',
            'facilities',
            'other'
        ],
        default: 'other'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed', 'rejected'],
        default: 'open'
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'conversation'
    },
    responses: [{
        respondent: {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'responses.respondent.userType'
            },
            userType: {
                type: String,
                enum: ['admin', 'teacher']
            },
            name: {
                type: String
            }
        },
        message: {
            type: String,
            required: true
        },
        attachments: [{
            name: String,
            url: String,
            type: String
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    resolution: {
        resolvedBy: {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'resolution.resolvedBy.userType'
            },
            userType: {
                type: String,
                enum: ['admin', 'teacher']
            },
            name: String
        },
        resolutionNote: String,
        resolutionDate: Date
    },
    attachments: [{
        name: String,
        url: String,
        type: String,
        size: Number
    }],
    tags: [{
        type: String,
        trim: true
    }],
    escalated: {
        type: Boolean,
        default: false
    },
    escalatedAt: {
        type: Date
    },
    escalatedTo: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin'
        },
        name: String
    },
    dueDate: {
        type: Date
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
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
complainSchema.index({ 'complainant.user': 1, createdAt: -1 });
complainSchema.index({ teacher: 1, status: 1 });
complainSchema.index({ student: 1, createdAt: -1 });
complainSchema.index({ status: 1, priority: 1 });
complainSchema.index({ category: 1, createdAt: -1 });

// Update lastActivityAt before save
complainSchema.pre('save', function(next) {
    this.lastActivityAt = new Date();
    next();
});

// Methods
complainSchema.methods.addResponse = function(respondent, message, attachments = []) {
    this.responses.push({
        respondent,
        message,
        attachments
    });
    this.lastActivityAt = new Date();
};

complainSchema.methods.updateStatus = function(status, resolvedBy = null, resolutionNote = '') {
    this.status = status;
    this.lastActivityAt = new Date();
    
    if (status === 'resolved' || status === 'closed') {
        this.resolution = {
            resolvedBy,
            resolutionNote,
            resolutionDate: new Date()
        };
    }
};

complainSchema.methods.escalate = function(escalatedTo) {
    this.escalated = true;
    this.escalatedAt = new Date();
    this.escalatedTo = escalatedTo;
    this.priority = 'high';
    this.lastActivityAt = new Date();
};

// Static methods
complainSchema.statics.getComplaintStats = async function(schoolId) {
    const stats = await this.aggregate([
        { $match: { school: schoolId } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    return stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
    }, {});
};

module.exports = mongoose.model("complain", complainSchema);
