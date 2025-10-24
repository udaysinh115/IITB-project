import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { School, Person, Message } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ParentHomePage = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState([]);
    const [messageCount, setMessageCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // In a production app, you would fetch real data from the API
                // For now, we'll use mock data
                const mockStudents = [
                    { 
                        _id: '1', 
                        name: 'John Smith', 
                        rollNum: '101',
                        sclassName: { name: 'Class 10A' },
                        examResult: [
                            { subName: { subName: 'Math' }, marksObtained: 85 },
                            { subName: { subName: 'Science' }, marksObtained: 78 }
                        ],
                        attendance: [
                            { date: new Date(), status: 'Present', subName: { subName: 'Math' } },
                            { date: new Date(), status: 'Present', subName: { subName: 'Science' } }
                        ]
                    }
                ];
                
                setStudentData(mockStudents);
                setMessageCount(3); // Mock message count
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Welcome, {currentUser?.name || 'Parent'}
            </Typography>
            
            <Grid container spacing={3} mt={2}>
                <Grid item xs={12} md={6} lg={4}>
                    <Card 
                        sx={{ 
                            cursor: 'pointer',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'scale(1.03)' }
                        }}
                        onClick={() => navigate('/Parent/student-performance')}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <School sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Typography variant="h6">Student Performance</Typography>
                            </Box>
                            <Typography variant="body1">
                                {studentData.length} {studentData.length === 1 ? 'Student' : 'Students'} Linked
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                View detailed academic performance
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={4}>
                    <Card 
                        sx={{ 
                            cursor: 'pointer',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'scale(1.03)' }
                        }}
                        onClick={() => navigate('/Parent/messages')}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Message sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Typography variant="h6">Messages</Typography>
                            </Box>
                            <Typography variant="body1">
                                {messageCount} Unread {messageCount === 1 ? 'Message' : 'Messages'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Communicate with teachers and staff
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={4}>
                    <Card 
                        sx={{ 
                            cursor: 'pointer',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'scale(1.03)' }
                        }}
                        onClick={() => navigate('/Parent/profile')}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Typography variant="h6">Profile</Typography>
                            </Box>
                            <Typography variant="body1">
                                {currentUser?.name || 'Parent'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                View and update your profile information
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {studentData.length > 0 && (
                <Box mt={4}>
                    <Typography variant="h5" gutterBottom>
                        Linked Students
                    </Typography>
                    <Grid container spacing={3}>
                        {studentData.map((student) => (
                            <Grid item xs={12} md={6} key={student._id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{student.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Roll Number: {student.rollNum}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Class: {student.sclassName?.name || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" mt={1}>
                                            Recent Performance:
                                        </Typography>
                                        {student.examResult && student.examResult.length > 0 ? (
                                            student.examResult.map((result, index) => (
                                                <Typography key={index} variant="body2">
                                                    {result.subName?.subName}: {result.marksObtained} marks
                                                </Typography>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No exam results available
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default ParentHomePage;