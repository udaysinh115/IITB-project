const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const Admin = require('../models/adminSchema');
const Teacher = require('../models/teacherSchema');
const Student = require('../models/studentSchema');
const Parent = require('../models/parentSchema');
const Sclass = require('../models/sclassSchema');
const Subject = require('../models/subjectSchema');
const Notice = require('../models/noticeSchema');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack_school', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await Promise.all([
            Admin.deleteMany({}),
            Teacher.deleteMany({}),
            Student.deleteMany({}),
            Parent.deleteMany({}),
            Sclass.deleteMany({}),
            Subject.deleteMany({}),
            Notice.deleteMany({})
        ]);

        console.log('✅ Cleared existing data');

        // Create Admin
        const adminPassword = await bcrypt.hash('admin123', 12);
        const admin = await Admin.create({
            name: 'School Administrator',
            email: 'admin@edutrack.com',
            password: adminPassword,
            role: 'Admin',
            schoolName: 'EduTrack Demo School'
        });
        console.log('✅ Created admin user');

        // Create Classes
        const classes = await Sclass.create([
            {
                sclassName: 'Class 9',
                school: admin._id
            },
            {
                sclassName: 'Class 10',
                school: admin._id
            },
            {
                sclassName: 'Class 11',
                school: admin._id
            },
            {
                sclassName: 'Class 12',
                school: admin._id
            }
        ]);
        console.log('✅ Created classes');

        // Create Subjects
        const subjects = [];
        const subjectNames = [
            { name: 'Mathematics', class: 0 },
            { name: 'Physics', class: 0 },
            { name: 'Chemistry', class: 0 },
            { name: 'Biology', class: 0 },
            { name: 'English', class: 0 },
            { name: 'Mathematics', class: 1 },
            { name: 'Physics', class: 1 },
            { name: 'Chemistry', class: 1 },
            { name: 'Computer Science', class: 1 },
            { name: 'English', class: 1 }
        ];

        for (const subjectData of subjectNames) {
            const subject = await Subject.create({
                subName: subjectData.name,
                subCode: `${subjectData.name.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 100)}`,
                sessions: Math.floor(Math.random() * 20) + 10,
                sclassName: classes[subjectData.class]._id,
                school: admin._id
            });
            subjects.push(subject);
        }
        console.log('✅ Created subjects');

        // Create Teachers
        const teacherPassword = await bcrypt.hash('teacher123', 12);
        const teachers = [];
        const teacherData = [
            {
                name: 'Dr. Sarah Johnson',
                email: 'sarah.johnson@edutrack.com',
                teachSubject: subjects[0]._id, // Mathematics
                teachSclass: classes[0]._id,
                dateOfBirth: new Date('1980-05-15'),
                gender: 'Female',
                phone: '+1-555-0101',
                address: '123 Teacher Street, Education City'
            },
            {
                name: 'Prof. Michael Chen',
                email: 'michael.chen@edutrack.com',
                teachSubject: subjects[1]._id, // Physics
                teachSclass: classes[0]._id,
                dateOfBirth: new Date('1975-09-22'),
                gender: 'Male',
                phone: '+1-555-0102',
                address: '456 Academic Avenue, Learning Town'
            },
            {
                name: 'Ms. Emily Davis',
                email: 'emily.davis@edutrack.com',
                teachSubject: subjects[2]._id, // Chemistry
                teachSclass: classes[1]._id,
                dateOfBirth: new Date('1985-03-10'),
                gender: 'Female',
                phone: '+1-555-0103',
                address: '789 Science Road, Knowledge City'
            },
            {
                name: 'Mr. James Wilson',
                email: 'james.wilson@edutrack.com',
                teachSubject: subjects[5]._id, // Mathematics Class 10
                teachSclass: classes[1]._id,
                dateOfBirth: new Date('1978-12-05'),
                gender: 'Male',
                phone: '+1-555-0104',
                address: '321 Math Lane, Calculation City'
            }
        ];

        for (const teacher of teacherData) {
            const newTeacher = await Teacher.create({
                ...teacher,
                password: teacherPassword,
                role: 'Teacher',
                school: admin._id
            });
            teachers.push(newTeacher);

            // Update subject with teacher
            await Subject.findByIdAndUpdate(teacher.teachSubject, { teacher: newTeacher._id });
        }
        console.log('✅ Created teachers');

        // Create Students
        const studentPassword = await bcrypt.hash('student123', 12);
        const students = [];
        const studentData = [
            {
                name: 'Alice Thompson',
                rollNum: 1001,
                sclassName: classes[0]._id,
                dateOfBirth: new Date('2007-04-12'),
                gender: 'Female',
                email: 'alice.thompson@student.edutrack.com',
                phone: '+1-555-1001',
                address: '100 Student Street, Learning District',
                emergencyContact: '+1-555-2001'
            },
            {
                name: 'Bob Rodriguez',
                rollNum: 1002,
                sclassName: classes[0]._id,
                dateOfBirth: new Date('2007-08-25'),
                gender: 'Male',
                email: 'bob.rodriguez@student.edutrack.com',
                phone: '+1-555-1002',
                address: '200 Youth Avenue, Study Town',
                emergencyContact: '+1-555-2002'
            },
            {
                name: 'Carol Kim',
                rollNum: 1003,
                sclassName: classes[1]._id,
                dateOfBirth: new Date('2006-11-08'),
                gender: 'Female',
                email: 'carol.kim@student.edutrack.com',
                phone: '+1-555-1003',
                address: '300 Academic Road, Knowledge Hub',
                emergencyContact: '+1-555-2003'
            },
            {
                name: 'David Singh',
                rollNum: 1004,
                sclassName: classes[1]._id,
                dateOfBirth: new Date('2006-02-19'),
                gender: 'Male',
                email: 'david.singh@student.edutrack.com',
                phone: '+1-555-1004',
                address: '400 Education Boulevard, Learn City',
                emergencyContact: '+1-555-2004'
            },
            {
                name: 'Emma Garcia',
                rollNum: 1005,
                sclassName: classes[0]._id,
                dateOfBirth: new Date('2007-06-30'),
                gender: 'Female',
                email: 'emma.garcia@student.edutrack.com',
                phone: '+1-555-1005',
                address: '500 Scholar Street, Brain Valley',
                emergencyContact: '+1-555-2005'
            }
        ];

        for (const student of studentData) {
            const newStudent = await Student.create({
                ...student,
                password: studentPassword,
                role: 'Student',
                school: admin._id,
                attendance: []
            });
            students.push(newStudent);
        }
        console.log('✅ Created students');

        // Create Parents
        const parentPassword = await bcrypt.hash('parent123', 12);
        const parents = [
            {
                name: 'John Thompson',
                email: 'john.thompson@parent.edutrack.com',
                children: [students[0]._id],
                dateOfBirth: new Date('1975-03-15'),
                gender: 'Male',
                phone: '+1-555-3001',
                address: '100 Student Street, Learning District',
                emergencyContact: '+1-555-4001'
            },
            {
                name: 'Maria Rodriguez',
                email: 'maria.rodriguez@parent.edutrack.com',
                children: [students[1]._id],
                dateOfBirth: new Date('1978-07-22'),
                gender: 'Female',
                phone: '+1-555-3002',
                address: '200 Youth Avenue, Study Town',
                emergencyContact: '+1-555-4002'
            },
            {
                name: 'Susan Kim',
                email: 'susan.kim@parent.edutrack.com',
                children: [students[2]._id],
                dateOfBirth: new Date('1973-12-10'),
                gender: 'Female',
                phone: '+1-555-3003',
                address: '300 Academic Road, Knowledge Hub',
                emergencyContact: '+1-555-4003'
            }
        ];

        for (const parent of parents) {
            await Parent.create({
                ...parent,
                password: parentPassword,
                role: 'Parent',
                school: admin._id
            });
        }
        console.log('✅ Created parents');

        // Create sample notices
        const notices = [
            {
                title: 'Welcome to New Academic Year',
                details: 'We welcome all students and parents to the new academic year 2024-25. Please check the school calendar for important dates.',
                date: new Date(),
                author: admin._id,
                school: admin._id
            },
            {
                title: 'Parent-Teacher Meeting',
                details: 'Parent-teacher meetings are scheduled for next weekend. Please check with your class teachers for specific timings.',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                author: admin._id,
                school: admin._id
            },
            {
                title: 'Sports Day Announcement',
                details: 'Annual sports day will be conducted next month. Students are encouraged to participate in various events.',
                date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                author: admin._id,
                school: admin._id
            }
        ];

        await Notice.create(notices);
        console.log('✅ Created notices');

        console.log('\n🎉 Database seeding completed successfully!\n');
        console.log('📋 Sample Credentials:');
        console.log('-------------------');
        console.log('👨‍💼 Admin:');
        console.log('  Email: admin@edutrack.com');
        console.log('  Password: admin123');
        console.log('\n👩‍🏫 Teacher:');
        console.log('  Email: sarah.johnson@edutrack.com');
        console.log('  Password: teacher123');
        console.log('\n👨‍🎓 Student:');
        console.log('  Roll Number: 1001');
        console.log('  Name: Alice Thompson');
        console.log('  Password: student123');
        console.log('\n👨‍👩‍👧‍👦 Parent:');
        console.log('  Email: john.thompson@parent.edutrack.com');
        console.log('  Password: parent123');
        console.log('\n💡 You can now login to test all features!');

    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();
        await seedData();
        console.log('\n✅ Seeding completed successfully');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📦 Database connection closed');
        process.exit(0);
    }
};

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { seedData, connectDB };