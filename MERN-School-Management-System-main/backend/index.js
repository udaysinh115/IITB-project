const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require("dotenv");
const path = require('path');

// Load environment variables first with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

const mongoose = require("mongoose");
const connectDB = require('./config/database');
const { globalErrorHandler } = require('./utils/responseHelper');
const Routes = require("./routes/route.js");

mongoose.set('bufferCommands', false);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
    }
});

const PORT = process.env.PORT || 5001;

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = process.env.CLIENT_URL ? 
            process.env.CLIENT_URL.split(',') : 
            ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
        
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Make io available to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Connect to database
connectDB().catch(() => {
    console.log('⚠️  Running in demo mode without database');
    console.log('💡 To enable full features, install MongoDB or use Docker');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join user-specific room for notifications
    socket.on('join', (userData) => {
        if (userData.userId) {
            socket.join(`user_${userData.userId}`);
            console.log(`User ${userData.userId} joined their room`);
        }
    });
    
    // Join conversation room for real-time messaging
    socket.on('joinConversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });
    
    // Leave conversation room
    socket.on('leaveConversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });
    
    // Handle typing indicators
    socket.on('typing', (data) => {
        socket.to(`conversation_${data.conversationId}`).emit('typing', {
            userId: data.userId,
            name: data.name,
            isTyping: true
        });
    });
    
    socket.on('stopTyping', (data) => {
        socket.to(`conversation_${data.conversationId}`).emit('typing', {
            userId: data.userId,
            name: data.name,
            isTyping: false
        });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });
}

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: "EduTrack API Server is running",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        features: {
            messaging: true,
            notifications: true,
            complaints: true,
            realTimeUpdates: true
        }
    });
});

// API Routes
app.use('/api', Routes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use(globalErrorHandler);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(async () => {
        await mongoose.connection.close();
        console.log('Server shut down complete.');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(async () => {
        await mongoose.connection.close();
        console.log('Server shut down complete.');
        process.exit(0);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 EduTrack Server running on port ${PORT}`);
    console.log(`📱 Socket.IO enabled for real-time features`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
