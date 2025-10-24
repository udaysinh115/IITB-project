const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');

// const adminRegister = async (req, res) => {
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPass = await bcrypt.hash(req.body.password, salt);

//         const admin = new Admin({
//             ...req.body,
//             password: hashedPass
//         });

//         const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
//         const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

//         if (existingAdminByEmail) {
//             res.send({ message: 'Email already exists' });
//         }
//         else if (existingSchool) {
//             res.send({ message: 'School name already exists' });
//         }
//         else {
//             let result = await admin.save();
//             result.password = undefined;
//             res.send(result);
//         }
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };

// const adminLogIn = async (req, res) => {
//     if (req.body.email && req.body.password) {
//         let admin = await Admin.findOne({ email: req.body.email });
//         if (admin) {
//             const validated = await bcrypt.compare(req.body.password, admin.password);
//             if (validated) {
//                 admin.password = undefined;
//                 res.send(admin);
//             } else {
//                 res.send({ message: "Invalid password" });
//             }
//         } else {
//             res.send({ message: "User not found" });
//         }
//     } else {
//         res.send({ message: "Email and password are required" });
//     }
// };

const adminRegister = async (req, res) => {
    try {
        // Create a mock successful response for demo purposes
        const mockAdmin = {
            _id: "admin123456",
            name: req.body.name || "Admin User",
            email: req.body.email,
            schoolName: req.body.schoolName || "EduTrack School",
            role: "Admin",
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Always return success for demo
        res.send(mockAdmin);
    } catch (err) {
        console.error("Admin registration error:", err);
        res.status(500).json({message: "Registration failed. Please try again."});
    }
};

const adminLogIn = async (req, res) => {
    console.log("Login attempt for role: Admin");
    try {
        // NOTE: For demo purposes, we’re returning a mock admin user without DB access
        // This allows the app to run even when MongoDB isn’t available
        const adminDemo = {
            _id: "demo-admin-001",
            name: req.body.name || "Admin",
            email: req.body.email || "admin@edutrack.com",
            role: "Admin",
            schoolName: "EduTrack Demo School"
        };
        return res.status(200).json(adminDemo);

        // The original logic can be restored when MongoDB is configured
        // const admin = await Admin.findOne({ email: req.body.email });
        // if (!admin) return res.status(404).json({ message: "Admin not found" });
        // const validated = await bcrypt.compare(req.body.password, admin.password);
        // if (!validated) return res.status(401).json({ message: "Invalid password" });
        // admin.password = undefined;
        // res.status(200).json(admin);
    } catch (err) {
        console.error("Admin login error:", err);
        res.status(500).json({ message: "Login failed. Please try again." });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            admin.password = undefined;
            res.send(admin);
        }
        else {
            res.send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// const deleteAdmin = async (req, res) => {
//     try {
//         const result = await Admin.findByIdAndDelete(req.params.id)

//         await Sclass.deleteMany({ school: req.params.id });
//         await Student.deleteMany({ school: req.params.id });
//         await Teacher.deleteMany({ school: req.params.id });
//         await Subject.deleteMany({ school: req.params.id });
//         await Notice.deleteMany({ school: req.params.id });
//         await Complain.deleteMany({ school: req.params.id });

//         res.send(result)
//     } catch (error) {
//         res.status(500).json(err);
//     }
// }

// const updateAdmin = async (req, res) => {
//     try {
//         if (req.body.password) {
//             const salt = await bcrypt.genSalt(10)
//             res.body.password = await bcrypt.hash(res.body.password, salt)
//         }
//         let result = await Admin.findByIdAndUpdate(req.params.id,
//             { $set: req.body },
//             { new: true })

//         result.password = undefined;
//         res.send(result)
//     } catch (error) {
//         res.status(500).json(err);
//     }
// }

// module.exports = { adminRegister, adminLogIn, getAdminDetail, deleteAdmin, updateAdmin };

module.exports = { adminRegister, adminLogIn, getAdminDetail };
