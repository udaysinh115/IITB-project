import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import { ChevronLeft, Home, Person, School, Message, Logout } from '@mui/icons-material';
import FlexBetween from '../../components/FlexBetween';

const navItems = [
    {
        text: "Dashboard",
        icon: <Home />,
        path: "/Parent/"
    },
    {
        text: "Profile",
        icon: <Person />,
        path: "/Parent/profile"
    },
    {
        text: "Student Performance",
        icon: <School />,
        path: "/Parent/student-performance"
    },
    {
        text: "Messages",
        icon: <Message />,
        path: "/Parent/messages"
    },
    {
        text: "Logout",
        icon: <Logout />,
        path: "/Parent/logout"
    }
];

const ParentSideBar = ({ user, drawerWidth, isSidebarOpen, setIsSidebarOpen, isNonMobile }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Box component="nav">
            {isSidebarOpen && (
                <Drawer
                    open={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    variant="persistent"
                    anchor="left"
                    sx={{
                        width: drawerWidth,
                        "& .MuiDrawer-paper": {
                            color: theme.palette.secondary[200],
                            backgroundColor: theme.palette.background.alt,
                            boxSizing: "border-box",
                            borderWidth: isNonMobile ? 0 : "2px",
                            width: drawerWidth
                        }
                    }}
                >
                    <Box width="100%">
                        <Box m="1.5rem 2rem 2rem 3rem">
                            <FlexBetween color={theme.palette.secondary.main}>
                                <Box display="flex" alignItems="center" gap="0.5rem">
                                    <Typography variant="h4" fontWeight="bold">
                                        EduTrack
                                    </Typography>
                                </Box>
                                {!isNonMobile && (
                                    <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                        <ChevronLeft />
                                    </IconButton>
                                )}
                            </FlexBetween>
                        </Box>
                        <List>
                            {navItems.map(({ text, icon, path }) => {
                                const lcText = text.toLowerCase();

                                return (
                                    <ListItem key={text} disablePadding>
                                        <ListItemButton
                                            onClick={() => {
                                                navigate(path);
                                            }}
                                            sx={{
                                                backgroundColor:
                                                    pathname === path
                                                        ? theme.palette.secondary[300]
                                                        : "transparent",
                                                color:
                                                    pathname === path
                                                        ? theme.palette.primary[600]
                                                        : theme.palette.secondary[100],
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    ml: "2rem",
                                                    color:
                                                        pathname === path
                                                            ? theme.palette.primary[600]
                                                            : theme.palette.secondary[100],
                                                }}
                                            >
                                                {icon}
                                            </ListItemIcon>
                                            <ListItemText primary={text} />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>

                    <Box position="absolute" bottom="2rem">
                        <Box textAlign="center">
                            <Typography
                                fontWeight="bold"
                                fontSize="0.9rem"
                                sx={{ color: theme.palette.secondary[100] }}
                            >
                                {user?.name}
                            </Typography>
                            <Typography
                                fontSize="0.8rem"
                                sx={{ color: theme.palette.secondary[200] }}
                            >
                                Parent
                            </Typography>
                        </Box>
                    </Box>
                </Drawer>
            )}
        </Box>
    );
};

export default ParentSideBar;