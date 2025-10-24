import axios from 'axios';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice';

// Enable mock mode to bypass backend connection issues
const MOCK_MODE = false; // Set to true to use mock data instead of real API
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5001/api";

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    
    if (MOCK_MODE) {
        // Mock successful login for development
        let mockUser;
        
        if (role === "Student") {
            mockUser = {
                _id: "mock123",
                name: fields.studentName || "Test Student",
                rollNum: fields.rollNum || "1",
                role: role,
                school: "Test School",
                sclassName: "Class 10",
                sclassId: "mock-class-id"
            };
        } else if (role === "Teacher") {
            mockUser = {
                _id: "mock123",
                name: fields.name || "Test Teacher",
                email: fields.email,
                role: role,
                school: "Test School",
                teachSclass: {
                    sclassName: "Class 10"
                }
            };
        } else {
            mockUser = {
                _id: "mock123",
                name: fields.name || "Test User",
                email: fields.email,
                role: role,
                school: "Test School"
            };
        }
        
        dispatch(authSuccess(mockUser));
        localStorage.setItem('user', JSON.stringify(mockUser));
        return true;
    }
    
    try {
        console.log(`Attempting to login with role: ${role} to ${BASE_URL}/${role}Login`);
        const result = await axios.post(`${BASE_URL}/${role}Login`, fields, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
            timeout: 10000
        });
        console.log("Login response:", result.data);
        if (result.data.role) {
            dispatch(authSuccess(result.data));
            localStorage.setItem('user', JSON.stringify(result.data));
            return true;
        } else {
            dispatch(authFailed(result.data.message || "Login failed"));
            return false;
        }
    } catch (error) {
        console.log("Login error:", error);
        if (error.message === "Network Error") {
            dispatch(authFailed("Network error - Please check your connection or the server may be down"));
        } else if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            dispatch(authFailed(error.response.data?.message || `Error: ${error.response.status}`));
        } else if (error.request) {
            // The request was made but no response was received
            dispatch(authFailed("No response received from server. Please try again later."));
        } else {
            // Something happened in setting up the request that triggered an Error
            dispatch(authError(error));
        }
        return false;
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    if (MOCK_MODE) {
        // Mock successful registration
        const mockUser = {
            _id: "mock123",
            name: fields.name || fields.schoolName || "Test User",
            email: fields.email,
            role: role,
            school: fields.schoolName || "Test School"
        };
        
        if (role === "Admin") {
            // For Admin, we need to both add the user and redirect to dashboard
            dispatch(authSuccess(mockUser));
            localStorage.setItem('user', JSON.stringify(mockUser));
        } else {
            dispatch(authSuccess(mockUser));
            localStorage.setItem('user', JSON.stringify(mockUser));
        }
        return true;
    }
    
    try {
        console.log(`Attempting to register with role: ${role} to ${process.env.REACT_APP_BASE_URL}/${role}Reg`);
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Reg`, fields, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
            timeout: 10000
        });
        console.log("Registration response:", result.data);
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
            localStorage.setItem('user', JSON.stringify(result.data));
            return true;
        }
        else if (result.data.school) {
            dispatch(stuffAdded());
            return true;
        }
        else {
            dispatch(authFailed(result.data.message || "Registration failed"));
            return false;
        }
    } catch (error) {
        console.log("Registration error:", error);
        if (error.message === "Network Error") {
            dispatch(authFailed("Network error - Please check your connection or the server may be down"));
        } else if (error.response) {
            dispatch(authFailed(error.response.data?.message || `Error: ${error.response.status}`));
        } else if (error.request) {
            dispatch(authFailed("No response received from server. Please try again later."));
        } else {
            dispatch(authError(error));
        }
        return false;
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

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


export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    dispatch(getFailed("Sorry the delete function has been disabled for now."));
}

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${address}Create`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};