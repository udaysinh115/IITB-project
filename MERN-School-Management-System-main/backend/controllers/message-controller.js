const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, asyncHandler } = require('../utils/responseHelper');
const Conversation = require('../models/conversationSchema');
const Message = require('../models/messageSchema');
const Notification = require('../models/notificationSchema');

// Get user conversations with pagination
const getConversations = asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
        // Find conversations where user is a participant
        const conversations = await Conversation.find({
            'participants.user': userId,
            isActive: true
        })
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await Conversation.countDocuments({
            'participants.user': userId,
            isActive: true
        });

        // Get unread message counts for each conversation
        const conversationsWithCounts = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversation: conv._id,
                    'readBy.user': { $ne: userId },
                    'sender.user': { $ne: userId },
                    deleted: false
                });

                return {
                    ...conv.toObject(),
                    unreadCount
                };
            })
        );

        sendPaginatedResponse(res, conversationsWithCounts, page, limit, total, 'Conversations retrieved successfully');
    } catch (error) {
        console.error('Get conversations error:', error);
        sendErrorResponse(res, 500, 'Failed to retrieve conversations');
    }
});

// Get or create conversation
const getOrCreateConversation = asyncHandler(async (req, res) => {
    const { id: userId, role, name } = req.user;
    const { participantId, participantType, participantName, type = 'direct', subject = '' } = req.body;

    try {
        // Check if conversation already exists between these participants
        let conversation = await Conversation.findOne({
            type,
            'participants.user': { $all: [userId, participantId] }
        });

        if (!conversation) {
            // Create new conversation
            conversation = new Conversation({
                participants: [
                    {
                        user: userId,
                        userType: role,
                        name,
                        role
                    },
                    {
                        user: participantId,
                        userType: participantType,
                        name: participantName,
                        role: participantType
                    }
                ],
                type,
                subject
            });

            await conversation.save();
        }

        sendSuccessResponse(res, 201, 'Conversation retrieved/created successfully', conversation);
    } catch (error) {
        console.error('Get/Create conversation error:', error);
        sendErrorResponse(res, 500, 'Failed to get or create conversation');
    }
});

// Get messages in a conversation
const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { id: userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    try {
        // Verify user is participant in conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.user': userId
        });

        if (!conversation) {
            return sendErrorResponse(res, 404, 'Conversation not found or access denied');
        }

        // Get messages
        const messages = await Message.find({
            conversation: conversationId,
            deleted: false
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        const total = await Message.countDocuments({
            conversation: conversationId,
            deleted: false
        });

        // Mark messages as read
        await Message.updateMany(
            {
                conversation: conversationId,
                'readBy.user': { $ne: userId },
                'sender.user': { $ne: userId }
            },
            {
                $addToSet: {
                    readBy: {
                        user: userId,
                        userType: req.user.role,
                        readAt: new Date()
                    }
                }
            }
        );

        // Reverse array to get chronological order
        const chronologicalMessages = messages.reverse();

        sendPaginatedResponse(res, chronologicalMessages, page, limit, total, 'Messages retrieved successfully');
    } catch (error) {
        console.error('Get messages error:', error);
        sendErrorResponse(res, 500, 'Failed to retrieve messages');
    }
});

// Send a message
const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { id: userId, role, name } = req.user;
    const { content, type = 'text', attachments = [] } = req.body;

    try {
        // Verify conversation exists and user is participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.user': userId
        });

        if (!conversation) {
            return sendErrorResponse(res, 404, 'Conversation not found or access denied');
        }

        // Create message
        const message = new Message({
            conversation: conversationId,
            sender: {
                user: userId,
                userType: role,
                name,
                role
            },
            content,
            type,
            attachments,
            school: req.user.schoolId
        });

        await message.save();

        // Update conversation's last message
        conversation.updateLastMessage(message._id);
        await conversation.save();

        // Create notifications for other participants
        const otherParticipants = conversation.participants.filter(
            p => p.user.toString() !== userId.toString()
        );

        await Promise.all(otherParticipants.map(async (participant) => {
            await Notification.createNotification({
                recipient: {
                    user: participant.user,
                    userType: participant.userType
                },
                sender: {
                    user: userId,
                    userType: role,
                    name
                },
                title: 'New Message',
                message: `${name} sent you a message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                type: 'message_received',
                actionUrl: `/messages/${conversationId}`,
                actionData: { conversationId, messageId: message._id },
                school: req.user.schoolId
            });
        }));

        // Emit real-time event (if socket.io is connected)
        if (req.io) {
            otherParticipants.forEach(participant => {
                req.io.to(`user_${participant.user}`).emit('newMessage', {
                    conversationId,
                    message: message.toObject()
                });
            });
        }

        sendSuccessResponse(res, 201, 'Message sent successfully', message);
    } catch (error) {
        console.error('Send message error:', error);
        sendErrorResponse(res, 500, 'Failed to send message');
    }
});

// Edit a message
const editMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { id: userId } = req.user;
    const { content } = req.body;

    try {
        // Find message and verify ownership
        const message = await Message.findOne({
            _id: messageId,
            'sender.user': userId,
            deleted: false
        });

        if (!message) {
            return sendErrorResponse(res, 404, 'Message not found or access denied');
        }

        // Update message
        message.content = content;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        // Emit real-time event
        if (req.io) {
            req.io.to(`conversation_${message.conversation}`).emit('messageEdited', {
                messageId,
                content,
                editedAt: message.editedAt
            });
        }

        sendSuccessResponse(res, 200, 'Message updated successfully', message);
    } catch (error) {
        console.error('Edit message error:', error);
        sendErrorResponse(res, 500, 'Failed to edit message');
    }
});

// Delete a message
const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { id: userId } = req.user;

    try {
        // Find message and verify ownership
        const message = await Message.findOne({
            _id: messageId,
            'sender.user': userId
        });

        if (!message) {
            return sendErrorResponse(res, 404, 'Message not found or access denied');
        }

        // Soft delete message
        message.softDelete();
        await message.save();

        // Emit real-time event
        if (req.io) {
            req.io.to(`conversation_${message.conversation}`).emit('messageDeleted', {
                messageId,
                deletedAt: message.deletedAt
            });
        }

        sendSuccessResponse(res, 200, 'Message deleted successfully');
    } catch (error) {
        console.error('Delete message error:', error);
        sendErrorResponse(res, 500, 'Failed to delete message');
    }
});

// Mark messages as read
const markAsRead = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { id: userId, role } = req.user;

    try {
        // Verify user is participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.user': userId
        });

        if (!conversation) {
            return sendErrorResponse(res, 404, 'Conversation not found or access denied');
        }

        // Mark all unread messages as read
        await Message.updateMany(
            {
                conversation: conversationId,
                'readBy.user': { $ne: userId },
                'sender.user': { $ne: userId }
            },
            {
                $addToSet: {
                    readBy: {
                        user: userId,
                        userType: role,
                        readAt: new Date()
                    }
                }
            }
        );

        sendSuccessResponse(res, 200, 'Messages marked as read');
    } catch (error) {
        console.error('Mark as read error:', error);
        sendErrorResponse(res, 500, 'Failed to mark messages as read');
    }
});

// Search messages
const searchMessages = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { query, conversationId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
        if (!query) {
            return sendErrorResponse(res, 400, 'Search query is required');
        }

        // Build search criteria
        let searchCriteria = {
            content: { $regex: query, $options: 'i' },
            deleted: false
        };

        // If specific conversation, limit to that conversation
        if (conversationId) {
            // Verify user access to conversation
            const conversation = await Conversation.findOne({
                _id: conversationId,
                'participants.user': userId
            });

            if (!conversation) {
                return sendErrorResponse(res, 404, 'Conversation not found or access denied');
            }

            searchCriteria.conversation = conversationId;
        } else {
            // Search across all user's conversations
            const userConversations = await Conversation.find({
                'participants.user': userId
            }).select('_id');

            searchCriteria.conversation = {
                $in: userConversations.map(c => c._id)
            };
        }

        const messages = await Message.find(searchCriteria)
            .populate('conversation', 'participants subject type')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments(searchCriteria);

        sendPaginatedResponse(res, messages, page, limit, total, 'Messages found');
    } catch (error) {
        console.error('Search messages error:', error);
        sendErrorResponse(res, 500, 'Failed to search messages');
    }
});

// Get message statistics
const getMessageStats = asyncHandler(async (req, res) => {
    const { id: userId, schoolId } = req.user;

    try {
        const stats = await Message.aggregate([
            {
                $match: {
                    school: schoolId,
                    deleted: false,
                    createdAt: { 
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get unread count for user
        const unreadCount = await Message.countDocuments({
            'readBy.user': { $ne: userId },
            'sender.user': { $ne: userId },
            deleted: false,
            conversation: {
                $in: await Conversation.find({
                    'participants.user': userId
                }).distinct('_id')
            }
        });

        sendSuccessResponse(res, 200, 'Message statistics retrieved successfully', {
            dailyStats: stats,
            unreadCount
        });
    } catch (error) {
        console.error('Get message stats error:', error);
        sendErrorResponse(res, 500, 'Failed to get message statistics');
    }
});

module.exports = {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    searchMessages,
    getMessageStats
};