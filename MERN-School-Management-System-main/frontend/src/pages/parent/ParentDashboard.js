import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import ParentSideBar from './ParentSideBar';
import ParentHomePage from './ParentHomePage';
import ParentProfile from './ParentProfile';
import ParentMessages from './ParentMessages';
import ParentStudentPerformance from './ParentStudentPerformance';
// Using direct logout functionality instead of component
import { logout } from '../../redux/userRelated/userSlice';

const ParentDashboard = () => {
    const { currentUser } = useSelector((state) => state.user);
    const theme = useTheme();
    const isNonMobile = useMediaQuery("(min-width: 760px)");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <Box display={isNonMobile ? "flex" : "block"} width="100%" height="100%">
            <ParentSideBar
                user={currentUser}
                isNonMobile={isNonMobile}
                drawerWidth="250px"
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />
            <Box flexGrow={1}>
                <Routes>
                    <Route path="/" element={<ParentHomePage />} />
                    <Route path="/profile" element={<ParentProfile />} />
                    <Route path="/messages" element={<ParentMessages />} />
                    <Route path="/student-performance" element={<ParentStudentPerformance />} />
                    <Route path="/logout" element={<ParentHomePage />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default ParentDashboard;