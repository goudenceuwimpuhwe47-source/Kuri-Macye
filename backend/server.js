const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Passport config
require('./config/passport')(passport);

// Connect to database
connectDB();

const app = express();

// Passport middleware
app.use(passport.initialize());

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/sellers', require('./routes/sellers'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));

// Error handler
app.use(require('./middleware/error'));

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
