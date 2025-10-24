const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use memory storage for MongoDB to avoid connection issues
        const mongoURI = 'mongodb://127.0.0.1:27017/edutrack_school';
        console.log('MongoDB URI: Using local MongoDB connection');
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        // Handle app termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
        
        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        // Don't exit process on connection failure to allow app to run
        console.log('Continuing without database connection...');
        return null;
    }
};

module.exports = connectDB;