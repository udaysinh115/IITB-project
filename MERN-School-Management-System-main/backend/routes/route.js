const router = require('express').Router();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { authLimiter, generalLimiter, strictLimiter, sanitizeInput, handleValidationErrors, validateEmail, validatePassword, validateName } = require('../middleware/security');

// Import controllers
const { login, register, refreshToken, logout, getProfile, updateProfile, changePassword } = require('../controllers/auth-controller');
const { adminRegister, adminLogIn, getAdminDetail} = require('../controllers/admin-controller.js');
const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require('../controllers/class-controller.js');
const { complainCreate, complainList, getAvailableTeachers } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const { parentRegister, mockParentRegister, parentLogin, mockParentLogin, getStudentPerformance, getMessages, sendMessage } = require('../controllers/parent-controller.js');
const {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance } = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacher, updateTeacherSubject, teacherAttendance } = require('../controllers/teacher-controller.js');

// Import new controllers
const { getConversations, getOrCreateConversation, getMessages: getChatMessages, sendMessage: sendChatMessage, editMessage, deleteMessage, markAsRead: markChatAsRead, searchMessages, getMessageStats } = require('../controllers/message-controller');
const { getNotifications, markAsRead: markNotificationAsRead, markAllAsRead, getUnreadCount, deleteNotification, createNotification, broadcastNotification, getNotificationStats } = require('../controllers/notification-controller');

// Apply global middleware
router.use(sanitizeInput);
router.use(generalLimiter);

// ============================
// AUTHENTICATION ROUTES
// ============================
router.post('/auth/login', authLimiter, [validateEmail, validatePassword, handleValidationErrors], login);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);
router.get('/auth/profile', authenticate, getProfile);
router.put('/auth/profile', authenticate, updateProfile);
router.put('/auth/change-password', authenticate, [validatePassword, handleValidationErrors], changePassword);

// ============================
// USER REGISTRATION (Admin only)
// ============================
router.post('/auth/register', authenticate, authorize('admin'), strictLimiter, register);

// ============================
// LEGACY ROUTES (for backwards compatibility)
// ============================
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.get("/Admin/:id", authenticate, authorize('admin'), getAdminDetail);

// Student

router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)

router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)

router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)

router.put("/Student/:id", updateStudent)

router.put('/UpdateExamResult/:id', updateExamResult)

router.put('/StudentAttendance/:id', studentAttendance)

router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)

// Teacher

router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)

router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)

router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)

router.put("/Teacher/:id", updateTeacher)
router.put("/TeacherSubject", updateTeacherSubject)

router.post('/TeacherAttendance/:id', teacherAttendance)

// Notice

router.post('/NoticeCreate', noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)

router.put("/Notice/:id", updateNotice)

// Parent
router.post('/ParentReg', parentRegister);
router.post('/ParentLogin', parentLogin);
router.get('/ParentStudentPerformance/:id', getStudentPerformance);
router.get('/ParentMessages/:id', getMessages);
router.post('/ParentMessage/:id', sendMessage);

// Complain

router.post('/ComplainCreate', complainCreate);

router.get('/ComplainList/:id', complainList);

// Sclass

router.post('/SclassCreate', sclassCreate);

router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)

router.get("/Sclass/Students/:id", getSclassStudents)

router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject

router.post('/SubjectCreate', subjectCreate);

router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

// ============================
// MESSAGING ROUTES
// ============================
router.get('/conversations', authenticate, getConversations);
router.post('/conversations', authenticate, getOrCreateConversation);
router.get('/conversations/:conversationId/messages', authenticate, getChatMessages);
router.post('/conversations/:conversationId/messages', authenticate, sendChatMessage);
router.put('/messages/:messageId', authenticate, editMessage);
router.delete('/messages/:messageId', authenticate, deleteMessage);
router.put('/conversations/:conversationId/read', authenticate, markChatAsRead);
router.get('/messages/search', authenticate, searchMessages);
router.get('/messages/stats', authenticate, getMessageStats);

// ============================
// NOTIFICATION ROUTES
// ============================
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:notificationId/read', authenticate, markNotificationAsRead);
router.put('/notifications/read-all', authenticate, markAllAsRead);
router.get('/notifications/unread-count', authenticate, getUnreadCount);
router.delete('/notifications/:notificationId', authenticate, deleteNotification);
router.post('/notifications', authenticate, authorize('admin'), createNotification);
router.post('/notifications/broadcast', authenticate, authorize('admin'), broadcastNotification);
router.get('/notifications/stats', authenticate, authorize('admin'), getNotificationStats);

// ============================
// ENHANCED COMPLAINT ROUTES
// ============================
router.get('/teachers/available', authenticate, getAvailableTeachers);

// Update existing complaint routes with authentication
router.post('/ComplainCreate', authenticate, complainCreate);
router.get('/ComplainList/:id', authenticate, complainList);

module.exports = router;