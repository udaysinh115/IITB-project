const { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse, asyncHandler } = require('../utils/responseHelper');
const Complain = require('../models/complainSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');
const Parent = require('../models/parentSchema.js');
const Conversation = require('../models/conversationSchema');
const Notification = require('../models/notificationSchema');

// Create a new complaint
const complainCreate = asyncHandler(async (req, res) => {
    const { id: userId, role, name, schoolId } = req.user;
    const { studentId, teacherId, title, description, category, priority, attachments } = req.body;

    try {
        // Verify teacher exists
        const teacher = await Teacher.findById(teacherId).select('name email');
        if (!teacher) {
            return sendErrorResponse(res, 404, 'Teacher not found');
        }

        // Verify student exists and get student info
        const student = await Student.findById(studentId).select('name rollNum sclassName');
        if (!student) {
            return sendErrorResponse(res, 404, 'Student not found');
        }

        // Create conversation for the complaint
        const conversation = new Conversation({
            participants: [
                {
                    user: userId,
                    userType: role,
                    name,
                    role
                },
                {
                    user: teacherId,
                    userType: 'teacher',
                    name: teacher.name,
                    role: 'teacher'
                }
            ],
            type: 'complaint',
            subject: title
        });

        await conversation.save();

        // Create complaint
        const complain = new Complain({
            complainant: {
                user: userId,
                userType: role,
                name
            },
            student: studentId,
            teacher: teacherId,
            title,
            description,
            category,
            priority: priority || 'medium',
            conversation: conversation._id,
            attachments: attachments || [],
            school: schoolId
        });

        await complain.save();

        // Populate the complaint with related data
        await complain.populate('student', 'name rollNum sclassName');
        await complain.populate('teacher', 'name email');

        // Create notification for teacher
        await Notification.createNotification({
            recipient: {
                user: teacherId,
                userType: 'teacher'
            },
            sender: {
                user: userId,
                userType: role,
                name
            },
            title: 'New Complaint Filed',
            message: `${name} has filed a complaint: ${title}`,
            type: 'complaint_update',
            priority: priority === 'urgent' ? 'urgent' : 'medium',
            actionUrl: `/complaints/${complain._id}`,
            actionData: { complaintId: complain._id },
            school: schoolId
        });

        sendSuccessResponse(res, 201, 'Complaint created successfully', complain);
    } catch (error) {
        console.error('Create complaint error:', error);
        sendErrorResponse(res, 500, 'Failed to create complaint');
    }
});

// Get complaints list with pagination and filters
const complainList = asyncHandler(async (req, res) => {
    const { role, id: userId, schoolId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { status, category, priority, teacherId, studentId } = req.query;

    try {
        // Build filter based on user role
        let filter = { school: schoolId };

        // Role-based filtering
        if (role === 'teacher') {
            filter.teacher = userId;
        } else if (role === 'student') {
            filter['complainant.user'] = userId;
        } else if (role === 'parent') {
            // Get parent's children
            const parent = await Parent.findById(userId).select('children');
            filter.student = { $in: parent.children };
        }

        // Additional filters
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (teacherId) filter.teacher = teacherId;
        if (studentId) filter.student = studentId;

        const complaints = await Complain.find(filter)
            .populate('student', 'name rollNum sclassName')
            .populate('teacher', 'name email')
            .sort({ lastActivityAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Complain.countDocuments(filter);

        sendPaginatedResponse(res, complaints, page, limit, total, 'Complaints retrieved successfully');
    } catch (error) {
        console.error('Get complaints error:', error);
        sendErrorResponse(res, 500, 'Failed to retrieve complaints');
    }
});

// Get available teachers for complaint selection
const getAvailableTeachers = asyncHandler(async (req, res) => {
    const { schoolId } = req.user;
    const { studentId } = req.query;

    try {
        let filter = { school: schoolId };
        
        // If student is specified, get teachers for that student's class
        if (studentId) {
            const student = await Student.findById(studentId).select('sclassName');
            if (student) {
                filter.teachSclass = student.sclassName;
            }
        }

        const teachers = await Teacher.find(filter)
            .select('name email teachSubject teachSclass')
            .populate('teachSubject', 'subName')
            .populate('teachSclass', 'sclassName')
            .sort('name');

        sendSuccessResponse(res, 200, 'Teachers retrieved successfully', teachers);
    } catch (error) {
        console.error('Get teachers error:', error);
        sendErrorResponse(res, 500, 'Failed to retrieve teachers');
    }
});

module.exports = { 
    complainCreate, 
    complainList,
    getAvailableTeachers
};
