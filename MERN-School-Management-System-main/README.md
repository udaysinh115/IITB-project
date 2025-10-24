<h1 align="center">
    🎓 EDUTRACK - PARENT TEACHER COMMUNICATION SYSTEM
</h1>

<h3 align="center">
Enhancing communication between parents and teachers while simplifying school management.<br>
Easily manage classes, attendance, performance, and feedback in one connected platform.<br>
Stay informed, stay connected, and make education collaborative.
</h3>

---

# 📘 About

**EduTrack - Parent Teacher Communication System** is a modern web application built with the **MERN stack (MongoDB, Express.js, React.js, Node.js)**.  
It bridges the communication gap between parents, teachers, and students while also providing powerful school management tools.

---

# 🚀 Features

### 👨‍🏫 User Roles
Supports **Admin**, **Teacher**, **Student**, and **Parent** roles — each with tailored access and functionality.

### 🧩 Admin Dashboard
- Add or remove students, teachers, and classes.
- Manage subjects, timetables, and user accounts.
- Oversee attendance, performance, and communication logs.

### 🗓️ Attendance Tracking
- Teachers can record daily attendance.
- Admins can generate attendance reports.
- Students and parents can view attendance history.

### 📊 Performance Assessment
- Teachers can upload marks and provide feedback.
- Students and parents can track progress visually with charts.
- Reports are auto-generated for clarity and insight.

### 💬 Parent–Teacher Communication
- Direct communication between teachers and parents.
- Share updates, discuss performance, and resolve issues efficiently.

### 📈 Data Visualization
- Interactive charts help visualize marks and performance trends.
- Real-time data synchronization between frontend and backend.

### 🔒 Secure Authentication
- Role-based login and JWT-based authentication.
- Data protection with secure API endpoints.

---

# 🛠️ Technologies Used

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React.js, Material UI, Redux |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Deployment** | Render (Server), Netlify (Client) |

---

# ⚙️ Installation Guide

## ✅ Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) or a **MongoDB Atlas** account

---

# 🧩 Step 1: Clone the Repository
git clone https://github.com/your-username/edutrack-parent-teacher-communication.git
cd edutrack-parent-teacher-communication

# ⚙️ Step 2: Backend Setup
cd backend
npm install

# Create .env file in backend (use Notepad or any editor)
# Add the following lines:
# MONGO_URL = mongodb://127.0.0.1/edutrack
# NODE_ENV = development
# FRONTEND_URL = http://localhost:3000

# 💡 If using MongoDB Atlas, replace MONGO_URL with your Atlas connection string.

# Run backend server
npm run dev
# 💻 Step 3: Frontend Setup
cd frontend
npm install

# Create .env file in frontend with:
# REACT_APP_BASE_URL = http://localhost:5001/api

# Start frontend server
npm start
