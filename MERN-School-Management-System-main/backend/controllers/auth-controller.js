const bcrypt = require('bcrypt');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const { sendSuccessResponse, sendErrorResponse, asyncHandler } = require('../utils/responseHelper');

const Admin = require('../models/adminSchema');
const Teacher = require('../models/teacherSchema');
const Student = require('../models/studentSchema');
const Parent = require('../models/parentSchema');
const Notification = require('../models/notificationSchema');

// Helper function to get user model based on role
const getUserModel = (role) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return Admin;
        case 'teacher':
            return Teacher;
        case 'student':
            return Student;
        case 'parent':
            return Parent;
        default:
            throw new Error('Invalid role');
    }
};

// Helper function to get user data without sensitive fields
const sanitizeUserData = (user, role) => {
    const userData = user.toObject();
    delete userData.password;
    
    // Add role if not present
    if (!userData.role) {
        userData.role = role;
    }
    
    return userData;
};

// Universal login function
const login = asyncHandler(async (req, res) => {
    const { email, password, rollNum, studentName, role } = req.body;
    
    try {
        const UserModel = getUserModel(role);
        let user;
        let query = {};
        
        // Build query based on role and provided credentials
        if (role.toLowerCase() === 'student') {
            if (!rollNum || !studentName || !password) {
                return sendErrorResponse(res, 400, 'Roll number, name, and password are required for student login');
            }
            query = { rollNum, name: studentName };
        } else {
            if (!email || !password) {
                return sendErrorResponse(res, 400, 'Email and password are required');
            }
            query = { email };
        }
        
        // Find user
        user = await UserModel.findOne(query);
        if (!user) {
            return sendErrorResponse(res, 401, 'Invalid credentials');
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return sendErrorResponse(res, 401, 'Invalid credentials');
        }
        
        // Populate related fields based on role
        if (role.toLowerCase() === 'student') {
            user = await user.populate('school', 'schoolName')
                             .populate('sclassName', 'sclassName');
        } else if (role.toLowerCase() === 'teacher') {
            user = await user.populate('school', 'schoolName')
                             .populate('teachSclass', 'sclassName')
                             .populate('teachSubject', 'subName');
        } else if (role.toLowerCase() === 'parent') {
            user = await user.populate('children', 'name rollNum')
                             .populate('school', 'schoolName');
        }
        
        // Generate tokens
        const tokenPayload = {
            id: user._id,
            role: role.toLowerCase(),
            email: user.email || null,
            name: user.name,
            schoolId: user.school?._id || user._id
        };
        
        const token = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        
        // Sanitize user data
        const userData = sanitizeUserData(user, role.toLowerCase());
        
        // Create welcome notification
        if (role.toLowerCase() !== 'admin') {
            await Notification.createNotification({
                recipient: {
                    user: user._id,
                    userType: role.toLowerCase()
                },
                sender: {
                    userType: 'system'
                },
                title: 'Welcome Back!',
                message: `You have successfully logged in to the system.`,
                type: 'system_update',
                school: userData.school?._id || userData._id
            });
        }
        
        // Set httpOnly cookie for refresh token (more secure)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        
        sendSuccessResponse(res, 200, 'Login successful', {
            user: userData,
            token,
            expiresIn: '7d'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        sendErrorResponse(res, 500, 'Login failed. Please try again.');
    }
});

// Universal registration function (Admin only for creating other users)
const register = asyncHandler(async (req, res) => {
    const { role, ...userData } = req.body;
    
    try {
        const UserModel = getUserModel(role);
        
        // Hash password
        const salt = await bcrypt.genSalt(12);
        userData.password = await bcrypt.hash(userData.password, salt);
        
        // Check for existing users
        let existingUser;
        if (role.toLowerCase() === 'student') {
            existingUser = await UserModel.findOne({
                rollNum: userData.rollNum,
                school: userData.school || userData.adminID,
                sclassName: userData.sclassName
            });
            if (existingUser) {
                return sendErrorResponse(res, 400, 'Student with this roll number already exists in this class');
            }
        } else {
            existingUser = await UserModel.findOne({ email: userData.email });
            if (existingUser) {
                return sendErrorResponse(res, 400, 'User with this email already exists');
            }
        }
        
        // Set school reference properly
        if (userData.adminID) {
            userData.school = userData.adminID;
            delete userData.adminID;
        }
        
        // Create user
        const newUser = new UserModel(userData);
        await newUser.save();
        
        // Update related models (for teachers, link to subject)
        if (role.toLowerCase() === 'teacher' && userData.teachSubject) {
            const Subject = require('../models/subjectSchema');
            await Subject.findByIdAndUpdate(userData.teachSubject, { teacher: newUser._id });
        }
        
        // Sanitize and return user data
        const sanitizedUser = sanitizeUserData(newUser, role.toLowerCase());
        
        // Create welcome notification
        await Notification.createNotification({
            recipient: {
                user: newUser._id,
                userType: role.toLowerCase()
            },
            sender: {
                user: req.user?.id,
                userType: req.user?.role || 'admin',
                name: req.user?.name || 'System Administrator'
            },
            title: 'Welcome to EduTrack!',
            message: `Your account has been created successfully. You can now log in to access the system.`,
            type: 'system_update',
            school: sanitizedUser.school?._id || sanitizedUser._id
        });
        
        sendSuccessResponse(res, 201, 'User registered successfully', sanitizedUser);
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return sendErrorResponse(res, 400, 'Validation failed', errors);
        }
        
        sendErrorResponse(res, 500, 'Registration failed. Please try again.');
    }
});

// Refresh token endpoint
const refreshToken = asyncHandler(async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            return sendErrorResponse(res, 401, 'Refresh token not provided');
        }
        
        const { verifyRefreshToken } = require('../config/jwt');
        const decoded = verifyRefreshToken(refreshToken);
        
        // Generate new tokens
        const newToken = generateToken({
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
            name: decoded.name,
            schoolId: decoded.schoolId
        });
        
        const newRefreshToken = generateRefreshToken({
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
            name: decoded.name,
            schoolId: decoded.schoolId
        });
        
        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        
        sendSuccessResponse(res, 200, 'Token refreshed successfully', {
            token: newToken,
            expiresIn: '7d'
        });
        
    } catch (error) {
        console.error('Token refresh error:', error);
        sendErrorResponse(res, 401, 'Invalid refresh token');
    }
});

// Logout endpoint
const logout = asyncHandler(async (req, res) => {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    sendSuccessResponse(res, 200, 'Logged out successfully');
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
    try {
        const { id, role } = req.user;
        const UserModel = getUserModel(role);
        
        let user = await UserModel.findById(id);
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        
        // Populate related fields based on role
        if (role === 'student') {
            user = await user.populate('school', 'schoolName')
                             .populate('sclassName', 'sclassName');
        } else if (role === 'teacher') {
            user = await user.populate('school', 'schoolName')
                             .populate('teachSclass', 'sclassName')
                             .populate('teachSubject', 'subName sessions');
        } else if (role === 'parent') {
            user = await user.populate('children', 'name rollNum sclassName')
                             .populate('school', 'schoolName');
        }
        
        const sanitizedUser = sanitizeUserData(user, role);
        sendSuccessResponse(res, 200, 'Profile retrieved successfully', sanitizedUser);
        
    } catch (error) {
        console.error('Get profile error:', error);
        sendErrorResponse(res, 500, 'Failed to retrieve profile');
    }
});

// Update current user profile
const updateProfile = asyncHandler(async (req, res) => {
    try {
        const { id, role } = req.user;
        const UserModel = getUserModel(role);
        
        // Remove sensitive fields that shouldn't be updated via this endpoint
        const { password, role: userRole, school, ...updateData } = req.body;
        
        // If password is being updated, hash it
        if (req.body.password) {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(req.body.password, salt);
        }
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        
        // Populate related fields
        if (role === 'student') {
            await updatedUser.populate('school', 'schoolName');
            await updatedUser.populate('sclassName', 'sclassName');
        } else if (role === 'teacher') {
            await updatedUser.populate('school', 'schoolName');
            await updatedUser.populate('teachSclass', 'sclassName');
            await updatedUser.populate('teachSubject', 'subName');
        }
        
        const sanitizedUser = sanitizeUserData(updatedUser, role);
        sendSuccessResponse(res, 200, 'Profile updated successfully', sanitizedUser);
        
    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return sendErrorResponse(res, 400, 'Validation failed', errors);
        }
        
        sendErrorResponse(res, 500, 'Failed to update profile');
    }
});

// Password change endpoint
const changePassword = asyncHandler(async (req, res) => {
    try {
        const { id, role } = req.user;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return sendErrorResponse(res, 400, 'Current password and new password are required');
        }
        
        const UserModel = getUserModel(role);
        const user = await UserModel.findById(id);
        
        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return sendErrorResponse(res, 400, 'Current password is incorrect');
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        await UserModel.findByIdAndUpdate(id, { password: hashedNewPassword });
        
        // Create notification
        await Notification.createNotification({
            recipient: {
                user: id,
                userType: role
            },
            sender: {
                userType: 'system'
            },
            title: 'Password Changed',
            message: 'Your password has been successfully changed.',
            type: 'system_update',
            school: user.school || user._id
        });
        
        sendSuccessResponse(res, 200, 'Password changed successfully');
        
    } catch (error) {
        console.error('Change password error:', error);
        sendErrorResponse(res, 500, 'Failed to change password');
    }
});

module.exports = {
    login,
    register,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
    changePassword
};