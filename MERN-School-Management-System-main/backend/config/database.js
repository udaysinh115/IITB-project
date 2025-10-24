const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // 1. Check for the MONGODB_URI environment variable (set on Render)
        const externalURI = process.env.MONGODB_URI;
        
        // 2. Determine the URI to use: External URI first, then local fallback
        const mongoURI = externalURI || 'mongodb://127.0.0.1:27017/edutrack_school';
        
        // 3. Log which URI is being used (helpful for debugging)
        if (externalURI) {
            // This is the message you should see in Render logs now:
            console.log('MongoDB URI: Using EXTERNAL Atlas connection.'); 
        } else {
            // This is the message if the environment variable is missing:
            console.log('MongoDB URI: Using local fallback connection.');
        }
        
        // Note: useNewUrlParser and useUnifiedTopology are typically unnecessary 
        // in modern Mongoose versions (v6+), but we will keep them commented out 
        // as a reminder.
        const conn = await mongoose.connect(mongoURI, {
            // useNewUrlParser: true, 
            // useUnifiedTopology: true,
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
        // This log will only show up if the connection attempt fails (e.g., cluster is paused)
        console.error('Error connecting to MongoDB:', error.message); 
        // Allow app to run in "demo mode" if connection fails
        console.log('Continuing without database connection...');
        return null;
    }
};

module.exports = connectDB;
