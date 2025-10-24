import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { AccountCircle, School, Group } from '@mui/icons-material';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";

  const { status, currentUser, currentRole } = useSelector((state) => state.user);

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = async (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        const email = "admin@edutrack.com";
        const fields = { email, password };
        setLoader(true);
        try {
          console.log("Attempting guest login as Admin");
          const result = await dispatch(loginUser(fields, user));
          if (result) {
            console.log("Guest login successful");
          } else {
            setMessage("Login failed. Please try again.");
            setShowPopup(true);
          }
        } catch (error) {
          console.error("Guest login error:", error);
          setMessage("Network error. Please try again.");
          setShowPopup(true);
        } finally {
          setLoader(false);
        }
      } else {
        navigate('/Adminlogin');
      }
    } 
    else if (user === "Student") {
      if (visitor === "guest") {
        const rollNum = "1";
        const studentName = "Demo Student";
        const fields = { rollNum, studentName, password };
        setLoader(true);
        try {
          const result = await dispatch(loginUser(fields, user));
          if (!result) {
            setMessage("Login failed. Please try again.");
            setShowPopup(true);
            setLoader(false);
          }
        } catch (error) {
          setMessage("Network error. Please try again.");
          setShowPopup(true);
          setLoader(false);
        }
      } else {
        navigate('/Studentlogin');
      }
    } 
    else if (user === "Parent") {
      if (visitor === "guest") {
        const email = "parent@example.com";
        const fields = { email, password };
        setLoader(true);
        try {
          const result = await dispatch(loginUser(fields, user));
          if (!result) {
            setMessage("Login failed. Please try again.");
            setShowPopup(true);
            setLoader(false);
          }
        } catch (error) {
          setMessage("Network error. Please try again.");
          setShowPopup(true);
          setLoader(false);
        }
      } else {
        navigate('/Parentlogin');
      }
    } 
    else if (user === "Teacher") {
      if (visitor === "guest") {
        const email = "tony@12";
        const fields = { email, password };
        setLoader(true);
        try {
          const result = await dispatch(loginUser(fields, user));
          if (!result) {
            setMessage("Login failed. Please try again.");
            setShowPopup(true);
            setLoader(false);
          }
        } catch (error) {
          setMessage("Network error. Please try again.");
          setShowPopup(true);
          setLoader(false);
        }
      } else {
        navigate('/Teacherlogin');
      }
    }
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') {
        navigate('/Admin/dashboard');
      } else if (currentRole === 'Student') {
        navigate('/Student/dashboard');
      } else if (currentRole === 'Teacher') {
        navigate('/Teacher/dashboard');
      } else if (currentRole === 'Parent') {
        navigate('/Parent/dashboard');
      }
    } else if (status === 'error') {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledContainer>
      <Container>
        <Grid container spacing={2} justifyContent="center">
          {/* Admin Card */}
          <Grid item xs={12} sm={6} md={3}>
            <div onClick={() => navigateHandler("Admin")}>
              <StyledPaper elevation={3}>
                <Box mb={2}>
                  <AccountCircle fontSize="large" />
                </Box>
                <StyledTypography>Admin</StyledTypography>
                Login as an administrator to access the dashboard to manage app data.
              </StyledPaper>
            </div>
          </Grid>

          {/* Student Card */}
          <Grid item xs={12} sm={6} md={3}>
            <div onClick={() => navigateHandler("Student")}>
              <StyledPaper elevation={3}>
                <Box mb={2}>
                  <School fontSize="large" />
                </Box>
                <StyledTypography>Student</StyledTypography>
                Login as a student to explore course materials and assignments.
              </StyledPaper>
            </div>
          </Grid>

          {/* Teacher Card */}
          <Grid item xs={12} sm={6} md={3}>
            <div onClick={() => navigateHandler("Teacher")}>
              <StyledPaper elevation={3}>
                <Box mb={2}>
                  <Group fontSize="large" />
                </Box>
                <StyledTypography>Teacher</StyledTypography>
                Login as a teacher to create courses, assignments, and track student progress.
              </StyledPaper>
            </div>
          </Grid>

          {/* Parent Card */}
          <Grid item xs={12} sm={6} md={3}>
            <div onClick={() => navigateHandler("Parent")}>
              <StyledPaper elevation={3}>
                <Box mb={2}>
                  <AccountCircle fontSize="large" />
                </Box>
                <StyledTypography>Parent</StyledTypography>
                Login as a parent to monitor your child's academic progress.
              </StyledPaper>
            </div>
          </Grid>
        </Grid>
      </Container>

      {/* Loader Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
      >
        <CircularProgress color="inherit" />
        Please Wait
      </Backdrop>

      {/* Popup Message */}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledContainer>
  );
};

export default ChooseUser;

// Styled Components
const StyledContainer = styled.div`
  background: linear-gradient(to bottom, #411d70, #19118b);
  height: 120vh;
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

const StyledPaper = styled(Paper)`
  padding: 20px;
  text-align: center;
  background-color: #1f1f38;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #2c2c6c;
    color: white;
  }
`;

const StyledTypography = styled.h2`
  margin-bottom: 10px;
  font-weight: 600;
`;
