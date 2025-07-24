const Message = require('../models/Message');
const User = require('../models/User');

class ChatController {
    // Get all chats for a user
    async getChats(req, res) {
        try {
            const recentMessages = await Message.aggregate([
                {
                    $match: {
                        $or: [
                            { senderId: req.user._id },
                            { receiverId: req.user._id }
                        ]
                    }
                },
                {
                    $sort: { timestamp: -1 }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ['$senderId', req.user._id] },
                                '$receiverId',
                                '$senderId'
                            ]
                        },
                        lastMessage: { $first: '$message' },
                        lastMessageTimestamp: { $first: '$timestamp' },
                        lastMessageIsRead: { $first: '$isRead' },
                        senderId: { $first: '$senderId' },
                        receiverId: { $first: '$receiverId' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'otherUser'
                    }
                },
                {
                    $unwind: '$otherUser'
                },
                {
                    $project: {
                        _id: 1,
                        lastMessage: 1,
                        lastMessageTimestamp: 1,
                        lastMessageIsRead: 1,
                        otherUser: {
                            _id: 1,
                            name: 1,
                            profilePhoto: 1,
                            userType: 1
                        }
                    }
                }
            ]);

            res.json({ success: true, chats: recentMessages });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Get chat history between two users
    async getChatHistory(req, res) {
        try {
            const messages = await Message.find({
                $or: [
                    { senderId: req.user.id, receiverId: req.params.userId },
                    { senderId: req.params.userId, receiverId: req.user.id }
                ]
            })
            .sort({ timestamp: 1 })
            .populate('senderId', 'name profilePhoto userType')
            .populate('receiverId', 'name profilePhoto userType');

            res.json({ success: true, messages });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Get all users for chat
    async getUsers(req, res) {
        try {
            const users = await User.find({ _id: { $ne: req.user.id } })
                .select('name profilePhoto userType');
            res.json({ success: true, users });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Create a new message
    async createMessage(req, res) {
        try {
            const { receiverId, message } = req.body;

            if (!receiverId || !message) {
                return res.status(400).json({
                    success: false,
                    message: "Recipient and message are required"
                });
            }

            const newMessage = new Message({
                senderId: req.user.id,
                receiverId,
                message,
                timestamp: new Date(),
                isRead: false
            });

            const savedMessage = await newMessage.save();
            const populatedMessage = await Message.findById(savedMessage._id)
                .populate('senderId', 'name profilePhoto userType')
                .populate('receiverId', 'name profilePhoto userType')
                .exec();

            res.status(201).json({
                success: true,
                message: savedMessage
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Mark messages as read
    async markMessagesAsRead(req, res) {
        try {
            const { messageIds } = req.body;

            if (!Array.isArray(messageIds)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid message IDs format"
                });
            }

            const result = await Message.updateMany(
                { _id: { $in: messageIds } },
                { $set: { isRead: true } }
            );

            res.json({
                success: true,
                message: "Messages marked as read",
                modifiedCount: result.modifiedCount
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Delete a message
    async deleteMessage(req, res) {
        try {
            const messageId = req.params.id;
            const message = await Message.findById(messageId);

            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: "Message not found"
                });
            }

            // Ensure user can only delete their own messages
            if (message.senderId.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to delete this message"
                });
            }

            await message.remove();
            res.json({
                success: true,
                message: "Message deleted successfully"
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ChatController();
