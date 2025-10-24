import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, Avatar, Button, TextField, CircularProgress } from '@mui/material';
import { Person, Edit } from '@mui/icons-material';
import axios from 'axios';

const ParentProfile = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        contactNumber: '',
        relationToStudent: ''
    });

    useEffect(() => {
        // In a real app, you would fetch the profile data from the API
        // For now, we'll use the data from Redux store
        if (currentUser) {
            setProfileData({
                name: currentUser.name || 'Parent Name',
                email: currentUser.email || 'parent@example.com',
                contactNumber: currentUser.contactNumber || '123-456-7890',
                relationToStudent: currentUser.relationToStudent || 'guardian'
            });
        }
    }, [currentUser]);

    const handleInputChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // In a real app, you would update the profile via API
            // For now, we'll just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setEditMode(false);
            setLoading(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>
            
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
                        <Avatar
                            sx={{ 
                                width: 150, 
                                height: 150, 
                                bgcolor: 'primary.main',
                                mb: 2
                            }}
                        >
                            <Person sx={{ fontSize: 80 }} />
                        </Avatar>
                        <Typography variant="h6">{profileData.name}</Typography>
                        <Typography variant="body1" color="text.secondary">Parent</Typography>
                        
                        {!editMode && (
                            <Button 
                                variant="contained" 
                                startIcon={<Edit />} 
                                sx={{ mt: 2 }}
                                onClick={() => setEditMode(true)}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                        {editMode ? (
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleInputChange}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Contact Number"
                                            name="contactNumber"
                                            value={profileData.contactNumber}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Relation to Student"
                                            name="relationToStudent"
                                            value={profileData.relationToStudent}
                                            onChange={handleInputChange}
                                            select
                                            SelectProps={{
                                                native: true,
                                            }}
                                        >
                                            <option value="father">Father</option>
                                            <option value="mother">Mother</option>
                                            <option value="guardian">Guardian</option>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                                        <Button 
                                            variant="outlined" 
                                            onClick={() => setEditMode(false)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            variant="contained"
                                            disabled={loading}
                                        >
                                            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="text.secondary">Full Name</Typography>
                                    <Typography variant="body1">{profileData.name}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="text.secondary">Email</Typography>
                                    <Typography variant="body1">{profileData.email}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="text.secondary">Contact Number</Typography>
                                    <Typography variant="body1">{profileData.contactNumber}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="text.secondary">Relation to Student</Typography>
                                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                        {profileData.relationToStudent}
                                    </Typography>
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default ParentProfile;