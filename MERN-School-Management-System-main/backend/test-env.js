const dotenv = require('dotenv');
const path = require('path');

// Try with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);