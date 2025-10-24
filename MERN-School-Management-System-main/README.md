<h1 align="center">
    EDUTRACK - SCHOOL MANAGEMENT SYSTEM
</h1>

<h3 align="center">
Streamline school management, class organization, and add students and faculty.<br>
Seamlessly track attendance, assess performance, and provide feedback. <br>
Access records, view marks, and communicate effortlessly.
</h3>

# About

EduTrack is a comprehensive school management system built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It streamlines school administration, class organization, and facilitates communication between students, teachers, and administrators.

## Features

- **User Roles:** The system supports three user roles: Admin, Teacher, and Student. Each role has specific functionalities and access levels.

- **Admin Dashboard:** Administrators can add new students and teachers, create classes and subjects, manage user accounts, and oversee system settings.

- **Attendance Tracking:** Teachers can easily take attendance for their classes, mark students as present or absent, and generate attendance reports.

- **Performance Assessment:** Teachers can assess students' performance by providing marks and feedback. Students can view their marks and track their progress over time.

- **Data Visualization:** Students can visualize their performance data through interactive charts and tables, helping them understand their academic performance at a glance.

- **Communication:** Users can communicate effortlessly through the system. Teachers can send messages to students and vice versa, promoting effective communication and collaboration.

## Technologies Used

- Frontend: React.js, Material UI, Redux
- Backend: Node.js, Express.js
- Database: MongoDB

<br>

# Installation

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Setup Instructions

### 1. Clone the Repository
```sh
git clone https://github.com/your-username/edutrack-school-management.git
cd edutrack-school-management
```

### 2. Backend Setup
```sh
cd backend
npm install
```

Create a `.env` file in the backend folder with the following content:
```
MONGO_URL = mongodb://127.0.0.1/edutrack
NODE_ENV = development
FRONTEND_URL = http://localhost:3000
```

> **Note:** If you're using MongoDB Atlas, replace the MONGO_URL with your connection string.

Start the backend server:
```sh
npm run dev
```

### 3. Frontend Setup
Open a new terminal window/tab and navigate to the project root:
```sh
cd frontend
npm install
```

The frontend should already have a `.env` file with:
```
REACT_APP_BASE_URL = http://localhost:5001/api
```

Start the frontend application:
```sh
npm start
```

### 4. Access the Application
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5001/api](http://localhost:5001/api)

## Demo Accounts

The system comes with pre-configured demo accounts for testing:

| Role    | Credentials                           |
|---------|---------------------------------------|
| Admin   | Email: admin@edutrack.com / Pass: zxc |
| Student | Roll: 1 / Name: Demo Student / Pass: zxc |
| Teacher | (Use the registration page to create) |

## Troubleshooting

If you encounter connection issues between frontend and backend:

1. Ensure both servers are running
2. Check that the `.env` files are properly configured
3. Verify MongoDB is running and accessible
4. Clear browser cache and restart the application

For example, in the `redux` folder, there are other folders like `userRelated`. In the `teacherRelated` folder, you'll find a file named `teacherHandle`. Similarly, other folders contain files with "Handle" in their names. Make sure to update these files as well.

The issue arises because the `.env` file in the frontend may not work for all users, while it works for me.

Additionally:

- When testing the project, start by signing up rather than logging in as a guest or using regular login if you haven't created an account yet.
  
  To use guest mode, navigate to `LoginPage.js` and provide an email and password from a project already created in the system. This simplifies the login process, and after creating your account, you can use your credentials.

These steps should resolve the network error in the frontend. If the issue persists, feel free to contact me for further assistance.

# Delete Feature Not Working Solution

When attempting to delete items, you may encounter a popup message stating, "Sorry, the delete function has been disabled for now." This message appears because I have disabled the delete function on my live site to prevent guests from deleting items. If you wish to enable the delete feature, please follow these steps:

1. Navigate to the `frontend > src > redux > userRelated > userHandle.js` file.

2. If you haven't made any changes, you should find the `deleteUser` function at line 71. It may be commented out. It might look like this:

```javascript
// export const deleteUser = (id, address) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
//         if (result.data.message) {
//             dispatch(getFailed(result.data.message));
//         } else {
//             dispatch(getDeleteSuccess());
//         }
//     } catch (error) {
//         dispatch(getError(error));
//     }
// }
```

3. Uncomment above `deleteUser` function and comment out this `deleteUser` function that is currently running from line 87 to line 90 :

```javascript
export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    dispatch(getFailed("Sorry the delete function has been disabled for now."));
}
```

4. If you have previously modified the code, you may find the `deleteUser` functions at different lines. In this case, uncomment the original code and comment out the current one.

5. Next, navigate to the `frontend > src > pages > admin` folder. Here, you will find different folders suffixed with "Related". Open each folder and locate files prefixed with "Show".

6. Open each file with "Show" as a prefix and search for a function named `deleteHandler`. For example:
   
```javascript
const deleteHandler = (deleteID, address) => {
  console.log(deleteID);
  console.log(address);
  setMessage("Sorry, the delete function has been disabled for now.");
  setShowPopup(true);
  // dispatch(deleteUser(deleteID, address))
  //   .then(() => {
  //     dispatch(getAllSclasses(adminID, "Sclass"));
  //   })
}
```

7. This is an example snippet from `ShowClasses`. In other files with "Show" as a prefix, it may differ.

8. Uncomment the commented-out code inside the `deleteHandler` function and comment out the existing code. It should resemble this:

```javascript
const deleteHandler = (deleteID, address) => {
  // console.log(deleteID);
  // console.log(address);
  // setMessage("Sorry, the delete function has been disabled for now.");
  // setShowPopup(true);
  dispatch(deleteUser(deleteID, address))
    .then(() => {
      dispatch(getAllSclasses(adminID, "Sclass"));
    })
}
```

9. Repeat these steps for every other file. In some cases, the `deleteHandler` function may also be found in files prefixed with "View". Check those files and repeat the same process.

If the issue persists, feel free to contact me for further assistance.

Don't forget to leave a star for this project if you found the solution helpful. Thank you!

# Deployment
* Render - server side
* Netlify - client side


# Login Routes
- Admin: `POST /api/AdminLogin`
- Teacher: `POST /api/TeacherLogin`
- Student: `POST /api/StudentLogin`
- Parent: `POST /api/ParentLogin`

# Sample Request Bodies
- Admin: `{ "email": "admin@edutrack.com", "password": "zxc" }`
- Teacher: `{ "email": "teacher@example.com", "password": "zxc" }`
- Student: `{ "rollNum": 1, "studentName": "Demo Student", "password": "zxc" }`
- Parent: `{ "email": "parent@example.com", "password": "zxc" }`

# Notes
- If MongoDB is not connected, Admin, Student, Teacher, and Parent logins return mock data for demo purposes.
- Ensure backend runs on `http://localhost:5001` and the frontend `.env` uses `REACT_APP_BASE_URL = http://localhost:5001/api`.

