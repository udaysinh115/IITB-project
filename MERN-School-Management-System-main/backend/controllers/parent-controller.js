const Parent = require("../models/parentSchema");
const Student = require("../models/studentSchema");
const Message = require("../models/messageSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Parent Registration
const parentRegister = async (req, res) => {
    try {
        const { name, email, password, contactNumber, relationToStudent, linkedStudentIds } = req.body;

        if (!name || !email || !password || !contactNumber || !relationToStudent) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if parent already exists
        const existingParent = await Parent.findOne({ email });
        if (existingParent) {
            return res.status(400).json({ message: "Parent already exists with this email" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new parent
        const parent = new Parent({
            name,
            email,
            password: hashedPassword,
            contactNumber,
            relationToStudent,
            linkedStudents: linkedStudentIds || []
        });

        // Save parent
        await parent.save();

        // Update student records with parent reference
        if (linkedStudentIds && linkedStudentIds.length > 0) {
            await Student.updateMany(
                { _id: { $in: linkedStudentIds } },
                { $push: { parents: parent._id } }
            );
        }

        res.status(201).json({ message: "Parent registered successfully" });
    } catch (error) {
        console.error("Error in parent registration:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// Mock parent registration for when DB is not available
const mockParentRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        res.status(201).json({ message: "Parent registered successfully (Mock)" });
    } catch (error) {
        console.error("Error in mock parent registration:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// Parent Login
const parentLogin = async (req, res) => {
    console.log("Login attempt for role: Parent");
    // Fast-fail if DB is disconnected
    if (mongoose.connection.readyState !== 1) {
        console.log("DB not connected. Using mock parent login.");
        const token = jwt.sign(
            { id: "mock-parent-id", role: "Parent" },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );
        return res.status(200).json({
            message: "Login successful (Mock)",
            token,
            role: "Parent",
            id: "mock-parent-id"
        });
    }
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find parent
        const parent = await Parent.findOne({ email });
        if (!parent) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, parent.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: parent._id, role: parent.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            role: parent.role,
            id: parent._id
        });
    } catch (error) {
        console.error("Error in parent login:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

// Mock parent login for when DB is not available
const mockParentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Mock parent data
        const mockParent = {
            _id: "mock-parent-id",
            name: "Mock Parent",
            email: email,
            role: "Parent"
        };

        // Generate JWT token
        const token = jwt.sign(
            { id: mockParent._id, role: mockParent.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful (Mock)",
            token,
            role: mockParent.role,
            id: mockParent._id
        });
    } catch (error) {
        console.error("Error in mock parent login:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

// Get student performance for a parent
const getStudentPerformance = async (req, res) => {
    try {
        const parentId = req.params.id;
        
        // Find parent with linked students
        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        // Get student details with exam results and attendance
        const students = await Student.find({ _id: { $in: parent.linkedStudents } })
            .populate('sclassName')
            .populate('examResult.subName')
            .populate('attendance.subName');

        res.status(200).json({ students });
    } catch (error) {
        console.error("Error fetching student performance:", error);
        res.status(500).json({ message: "Server error while fetching student performance" });
    }
};

// Get messages for a parent
const getMessages = async (req, res) => {
    try {
        const parentId = req.params.id;
        
        // Find messages where parent is receiver or sender
        const messages = await Message.find({
            $or: [
                { senderId: parentId, senderModel: 'parent' },
                { receiverId: parentId, receiverModel: 'parent' }
            ]
        })
        .sort({ createdAt: -1 });

        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server error while fetching messages" });
    }
};

// Send a message
const sendMessage = async (req, res) => {
    try {
        const parentId = req.params.id;
        const { receiverId, receiverModel, message, school } = req.body;

        if (!receiverId || !receiverModel || !message || !school) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create new message
        const newMessage = new Message({
            senderId: parentId,
            senderModel: 'parent',
            receiverId,
            receiverModel,
            message,
            school
        });

        // Save message
        await newMessage.save();

        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Server error while sending message" });
    }
};

module.exports = {
    parentRegister,
    mockParentRegister,
    parentLogin,
    mockParentLogin,
    getStudentPerformance,
    getMessages,
    sendMessage
};