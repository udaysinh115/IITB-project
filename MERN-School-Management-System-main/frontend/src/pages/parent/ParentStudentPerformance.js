import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, CircularProgress, Tabs, Tab, Card, CardContent, Divider } from '@mui/material';
import { School, Assignment, EventNote } from '@mui/icons-material';
import axios from 'axios';

const ParentStudentPerformance = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                // In a real app, you would fetch data from the API
                // For now, we'll use mock data
                const mockStudents = [
                    {
                        _id: '1',
                        name: 'John Smith',
                        rollNum: '101',
                        sclassName: { name: 'Class 10A' },
                        examResult: [
                            { subName: { subName: 'Math', _id: 'm1' }, marksObtained: 85 },
                            { subName: { subName: 'Science', _id: 's1' }, marksObtained: 78 },
                            { subName: { subName: 'English', _id: 'e1' }, marksObtained: 92 },
                            { subName: { subName: 'History', _id: 'h1' }, marksObtained: 65 }
                        ],
                        attendance: [
                            { date: new Date('2023-05-01'), status: 'Present', subName: { subName: 'Math', _id: 'm1' } },
                            { date: new Date('2023-05-01'), status: 'Present', subName: { subName: 'Science', _id: 's1' } },
                            { date: new Date('2023-05-02'), status: 'Present', subName: { subName: 'Math', _id: 'm1' } },
                            { date: new Date('2023-05-02'), status: 'Absent', subName: { subName: 'Science', _id: 's1' } },
                            { date: new Date('2023-05-03'), status: 'Present', subName: { subName: 'Math', _id: 'm1' } }
                        ]
                    }
                ];
                
                setStudents(mockStudents);
                if (mockStudents.length > 0) {
                    setSelectedStudent(mockStudents[0]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching student data:", error);
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [currentUser]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleStudentChange = (student) => {
        setSelectedStudent(student);
        setTabValue(0);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (students.length === 0) {
        return (
            <Box p={3}>
                <Typography variant="h5">No students linked to your account</Typography>
                <Typography variant="body1" mt={2}>
                    Please contact the school administrator to link your children to your account.
                </Typography>
            </Box>
        );
    }

    // Calculate attendance percentage
    const calculateAttendancePercentage = () => {
        if (!selectedStudent || !selectedStudent.attendance || selectedStudent.attendance.length === 0) {
            return 0;
        }
        
        const totalDays = selectedStudent.attendance.length;
        const presentDays = selectedStudent.attendance.filter(a => a.status === 'Present').length;
        return Math.round((presentDays / totalDays) * 100);
    };

    // Calculate average marks
    const calculateAverageMarks = () => {
        if (!selectedStudent || !selectedStudent.examResult || selectedStudent.examResult.length === 0) {
            return 0;
        }
        
        const totalMarks = selectedStudent.examResult.reduce((sum, result) => sum + result.marksObtained, 0);
        return Math.round(totalMarks / selectedStudent.examResult.length);
    };

    // Group attendance by date
    const groupAttendanceByDate = () => {
        if (!selectedStudent || !selectedStudent.attendance) return {};
        
        const grouped = {};
        selectedStudent.attendance.forEach(item => {
            const dateStr = new Date(item.date).toLocaleDateString();
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(item);
        });
        
        return grouped;
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Student Performance
            </Typography>
            
            {students.length > 1 && (
                <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                        Select Student
                    </Typography>
                    <Grid container spacing={2}>
                        {students.map(student => (
                            <Grid item xs={12} sm={6} md={4} key={student._id}>
                                <Card 
                                    sx={{ 
                                        cursor: 'pointer',
                                        bgcolor: selectedStudent?._id === student._id ? 'primary.light' : 'background.paper',
                                        '&:hover': { boxShadow: 3 }
                                    }}
                                    onClick={() => handleStudentChange(student)}
                                >
                                    <CardContent>
                                        <Typography variant="h6">{student.name}</Typography>
                                        <Typography variant="body2">
                                            Roll Number: {student.rollNum}
                                        </Typography>
                                        <Typography variant="body2">
                                            Class: {student.sclassName?.name || 'N/A'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
            
            {selectedStudent && (
                <>
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Box textAlign="center" p={2}>
                                    <School sx={{ fontSize: 60, color: 'primary.main' }} />
                                    <Typography variant="h6" mt={1}>
                                        {selectedStudent.name}
                                    </Typography>
                                    <Typography variant="body1">
                                        Roll Number: {selectedStudent.rollNum}
                                    </Typography>
                                    <Typography variant="body1">
                                        Class: {selectedStudent.sclassName?.name || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        p: 2
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Attendance
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            position: 'relative',
                                            display: 'inline-flex',
                                            my: 1
                                        }}
                                    >
                                        <CircularProgress 
                                            variant="determinate" 
                                            value={calculateAttendancePercentage()} 
                                            size={80}
                                            thickness={5}
                                            color={calculateAttendancePercentage() > 75 ? "success" : "warning"}
                                        />
                                        <Box
                                            sx={{
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                position: 'absolute',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant="h6" component="div">
                                                {calculateAttendancePercentage()}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        p: 2
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Average Performance
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            position: 'relative',
                                            display: 'inline-flex',
                                            my: 1
                                        }}
                                    >
                                        <CircularProgress 
                                            variant="determinate" 
                                            value={(calculateAverageMarks() / 100) * 100} 
                                            size={80}
                                            thickness={5}
                                            color={calculateAverageMarks() > 70 ? "success" : "warning"}
                                        />
                                        <Box
                                            sx={{
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                position: 'absolute',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant="h6" component="div">
                                                {calculateAverageMarks()}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                    
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                            <Tab icon={<Assignment />} label="Exam Results" />
                            <Tab icon={<EventNote />} label="Attendance" />
                        </Tabs>
                        
                        {tabValue === 0 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Exam Results
                                </Typography>
                                {selectedStudent.examResult && selectedStudent.examResult.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {selectedStudent.examResult.map((result, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6">
                                                            {result.subName?.subName || 'Subject'}
                                                        </Typography>
                                                        <Typography 
                                                            variant="h4" 
                                                            color={result.marksObtained >= 70 ? 'success.main' : 'warning.main'}
                                                        >
                                                            {result.marksObtained}%
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Typography variant="body1">
                                        No exam results available
                                    </Typography>
                                )}
                            </Box>
                        )}
                        
                        {tabValue === 1 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Attendance Record
                                </Typography>
                                {selectedStudent.attendance && selectedStudent.attendance.length > 0 ? (
                                    Object.entries(groupAttendanceByDate()).map(([date, records]) => (
                                        <Box key={date} mb={2}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {date}
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Grid container spacing={2}>
                                                {records.map((record, idx) => (
                                                    <Grid item xs={12} sm={6} md={4} key={idx}>
                                                        <Card 
                                                            sx={{ 
                                                                bgcolor: record.status === 'Present' 
                                                                    ? 'success.light' 
                                                                    : 'error.light'
                                                            }}
                                                        >
                                                            <CardContent>
                                                                <Typography variant="body1">
                                                                    {record.subName?.subName || 'Subject'}
                                                                </Typography>
                                                                <Typography variant="h6">
                                                                    {record.status}
                                                                </Typography>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body1">
                                        No attendance records available
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default ParentStudentPerformance;