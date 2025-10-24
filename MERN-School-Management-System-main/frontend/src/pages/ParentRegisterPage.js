import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/userRelated/userHandle';
import { Box, TextField, Button, Typography, MenuItem, CircularProgress, FormControl, InputLabel, Select } from '@mui/material';
import styled from 'styled-components';
import Popup from '../components/Popup';
import axios from 'axios';

const ParentRegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, error } = useSelector((state) => state.user);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        contactNumber: '',
        relationToStudent: '',
        linkedStudentIds: []
    });
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                // In a real app, you would fetch students from the backend
                // For now, we'll use mock data
                const mockStudents = [
                    { _id: '1', name: 'Student 1', rollNum: '101' },
                    { _id: '2', name: 'Student 2', rollNum: '102' },
                    { _id: '3', name: 'Student 3', rollNum: '103' }
                ];
                setStudents(mockStudents);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching students:", error);
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const result = await dispatch(registerUser(formData, "Parent"));
            if (result && result.success) {
                navigate('/Parentlogin');
            } else {
                setMessage(error || "Registration failed. Please try again.");
                setShowPopup(true);
            }
        } catch (error) {
            setMessage("Network error. Please try again.");
            setShowPopup(true);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStudentChange = (e) => {
        setFormData({ ...formData, linkedStudentIds: e.target.value });
    };

    return (
        <StyledContainer>
            <StyledBox>
                <Typography variant="h4" align="center" gutterBottom>
                    Parent Registration
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Contact Number"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Relation to Student</InputLabel>
                        <Select
                            name="relationToStudent"
                            value={formData.relationToStudent}
                            onChange={handleInputChange}
                            required
                        >
                            <MenuItem value="father">Father</MenuItem>
                            <MenuItem value="mother">Mother</MenuItem>
                            <MenuItem value="guardian">Guardian</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Link to Students</InputLabel>
                        <Select
                            multiple
                            name="linkedStudentIds"
                            value={formData.linkedStudentIds}
                            onChange={handleStudentChange}
                            disabled={loading}
                        >
                            {students.map((student) => (
                                <MenuItem key={student._id} value={student._id}>
                                    {student.name} (Roll: {student.rollNum})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={status === 'loading'}
                        sx={{ mt: 2 }}
                    >
                        {status === 'loading' ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Register'
                        )}
                    </Button>
                </form>
                <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                    Already have an account?{' '}
                    <Link to="/Parentlogin" style={{ textDecoration: 'none' }}>
                        Login
                    </Link>
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        Back to Home
                    </Link>
                </Typography>
            </StyledBox>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </StyledContainer>
    );
};

export default ParentRegisterPage;

const StyledContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
`;

const StyledBox = styled(Box)`
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
`;