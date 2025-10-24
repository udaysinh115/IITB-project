import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import Popup from '../components/Popup';

const ParentLoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, error, currentRole } = useSelector((state) => state.user);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const result = await dispatch(loginUser(formData, "Parent"));
            if (!result) {
                setMessage(error || "Login failed. Please try again.");
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

    return (
        <StyledContainer>
            <StyledBox>
                <Typography variant="h4" align="center" gutterBottom>
                    Parent Login
                </Typography>
                <form onSubmit={handleSubmit}>
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
                            'Login'
                        )}
                    </Button>
                </form>
                <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                    Don't have an account?{' '}
                    <Link to="/ParentRegister" style={{ textDecoration: 'none' }}>
                        Register
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

export default ParentLoginPage;

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
    max-width: 400px;
`;