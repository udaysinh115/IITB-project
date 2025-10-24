import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    TextField, 
    Button, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar, 
    Avatar, 
    Divider, 
    CircularProgress,
    Card,
    CardContent
} from '@mui/material';
import { Send, Person, School } from '@mui/icons-material';
import axios from 'axios';

const ParentMessages = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch teachers from the API
                const teachersResponse = await axios.get('/api/teachers');
                const teachersData = teachersResponse.data.teachers || [];
                
                // Fetch messages for the current parent
                const messagesResponse = await axios.get(`/api/parents/${currentUser._id}/messages`);
                const messagesData = messagesResponse.data.messages || [];
                
                // Fetch linked students for the current parent
                const studentsResponse = await axios.get(`/api/parents/${currentUser._id}/students`);
                const studentsData = studentsResponse.data.students || [];
                
                setTeachers(teachersData);
                setMessages(messagesData);
                setStudents(studentsData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                // If API fails, use fallback data for demo purposes
                const fallbackTeachers = [
                    { _id: 't1', name: 'Ms. Johnson', subject: 'Mathematics' },
                    { _id: 't2', name: 'Mr. Davis', subject: 'Science' },
                    { _id: 't3', name: 'Mrs. Wilson', subject: 'English' }
                ];
                
                const fallbackMessages = [
                    { 
                        _id: 'm1', 
                        sender: { _id: 't1', name: 'Ms. Johnson', model: 'Teacher' }, 
                        receiver: { _id: currentUser._id, model: 'Parent' },
                        content: 'Hello, I wanted to discuss your child\'s recent math test performance.',
                        createdAt: new Date('2023-05-10T10:30:00'),
                        read: true
                    }
                ];

                const fallbackStudents = [
                    {
                        _id: 's1',
                        name: "Your Child",
                        rollNum: '101',
                        sclassName: { name: 'Class 10A' }
                    }
                ];
                
                setTeachers(fallbackTeachers);
                setMessages(fallbackMessages);
                setStudents(fallbackStudents);
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const handleTeacherSelect = (teacher) => {
        setSelectedTeacher(teacher);
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedTeacher) return;

        try {
            // Create message object
            const messageData = {
                receiverId: selectedTeacher._id,
                receiverModel: 'teacher',
                message: messageText,
                school: currentUser.school || currentUser.schoolId
            };

            // Send message to API
            await axios.post(`/api/parents/${currentUser._id}/messages`, messageData);
            
            // Optimistically update UI
            const newMessage = {
                _id: `new-${Date.now()}`,
                sender: { _id: currentUser._id, name: currentUser.name, model: 'Parent' },
                receiver: { _id: selectedTeacher._id, model: 'Teacher' },
                content: messageText,
                createdAt: new Date(),
                read: false
            };

            setMessages([...messages, newMessage]);
            setMessageText('');
            
            // Refresh messages to get the actual saved message from server
            const messagesResponse = await axios.get(`/api/parents/${currentUser._id}/messages`);
            const messagesData = messagesResponse.data.messages || [];
            setMessages(messagesData);
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
        }
    };

    const getFilteredMessages = () => {
        if (!selectedTeacher) return [];
        
        return messages.filter(message => 
            (message.sender._id === selectedTeacher._id && message.receiver._id === currentUser._id) ||
            (message.sender._id === currentUser._id && message.receiver._id === selectedTeacher._id)
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    };

    const getUnreadCount = (teacherId) => {
        return messages.filter(message => 
            message.sender._id === teacherId && 
            message.receiver._id === currentUser._id && 
            !message.read
        ).length;
    };

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
                Messages
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Teachers
                        </Typography>
                        <List>
                            {teachers.map((teacher) => (
                                <React.Fragment key={teacher._id}>
                                    <ListItem 
                                        button 
                                        onClick={() => handleTeacherSelect(teacher)}
                                        selected={selectedTeacher && selectedTeacher._id === teacher._id}
                                        sx={{ 
                                            borderRadius: 1,
                                            mb: 1,
                                            bgcolor: selectedTeacher && selectedTeacher._id === teacher._id 
                                                ? 'primary.light' 
                                                : 'background.paper'
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                <Person />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={teacher.name} 
                                            secondary={teacher.subject} 
                                        />
                                        {getUnreadCount(teacher._id) > 0 && (
                                            <Box 
                                                sx={{ 
                                                    bgcolor: 'error.main', 
                                                    color: 'white', 
                                                    borderRadius: '50%', 
                                                    width: 24, 
                                                    height: 24, 
                                                    display: 'flex', 
                                                    justifyContent: 'center', 
                                                    alignItems: 'center' 
                                                }}
                                            >
                                                {getUnreadCount(teacher._id)}
                                            </Box>
                                        )}
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </React.Fragment>
                            ))}
                        </List>

                        <Box mt={4}>
                            <Typography variant="h6" gutterBottom>
                                Your Children
                            </Typography>
                            {students.map((student) => (
                                <Card key={student._id} sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center">
                                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                                <School />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {student.name}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Roll: {student.rollNum}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Class: {student.sclassName?.name || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
                        {selectedTeacher ? (
                            <>
                                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, mb: 2 }}>
                                    <Typography variant="h6">
                                        {selectedTeacher.name} - {selectedTeacher.subject}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, p: 2 }}>
                                    {getFilteredMessages().length > 0 ? (
                                        getFilteredMessages().map((message) => (
                                            <Box 
                                                key={message._id} 
                                                sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: message.sender._id === currentUser._id ? 'flex-end' : 'flex-start',
                                                    mb: 2
                                                }}
                                            >
                                                <Box 
                                                    sx={{ 
                                                        maxWidth: '70%', 
                                                        p: 2, 
                                                        borderRadius: 2,
                                                        bgcolor: message.sender._id === currentUser._id 
                                                            ? 'primary.light' 
                                                            : 'grey.100',
                                                        position: 'relative',
                                                        '&::after': message.read === false && message.sender._id === currentUser._id ? {
                                                            content: '""',
                                                            position: 'absolute',
                                                            bottom: 5,
                                                            right: 5,
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            backgroundColor: 'info.main',
                                                        } : {}
                                                    }}
                                                >
                                                    <Typography variant="body1">
                                                        {message.content || message.message}
                                                    </Typography>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                        {message.sender._id === currentUser._id && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                                {message.read ? 'Read' : 'Sent'}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))
                                    ) : (
                                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                            <Typography variant="body1" color="text.secondary">
                                                No messages yet. Start a conversation!
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                
                                <Box sx={{ display: 'flex', p: 1 }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Type a message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        sx={{ ml: 1 }}
                                        onClick={handleSendMessage}
                                        disabled={!messageText.trim()}
                                    >
                                        <Send />
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <Typography variant="h6" color="text.secondary">
                                    Select a teacher to start messaging
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ParentMessages;