const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'goudenceuwimpuhwe47@gmail.com' });

        if (adminExists) {
            console.log('Admin user already exists.');
            process.exit();
        }

        await User.create({
            name: 'Kuri-Macye Admin',
            email: 'goudenceuwimpuhwe47@gmail.com',
            password: 'kurimake123',
            role: 'admin',
            isVerified: true
        });

        console.log('Default Admin Created Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importData();
