const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
// Initialize Express
const app = express();

app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/SignIn")
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.log("Database connection failed", err));

// User Schema with email validation
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
});

const User = mongoose.model("User", userSchema);

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Static files (public folder)
app.use(express.static('public'));

// Handle the root route
app.get('/', (req, res) => {
    res.redirect('/signup');  // Redirect to the signup page
});

// Signup route
app.get('/signup', (req, res) => {
    res.render('signup');  // Ensure signup.ejs exists in the 'views' folder
});

// Signin route
app.get('/signin', (req, res) => {
    res.render('signin');  // Ensure signin.ejs exists in the 'views' folder
});

// POST /api/signup
app.post('https://assignment-2-talal-rashid-23-pwbcs-1002.vercel.app/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).send('Email already in use.');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name: username,
        email,
        password: hashedPassword
    });

    try {
        await newUser.save();
        res.status(201).send('User registered successfully!');
    } catch (error) {
        res.status(500).send('Error saving user.');
    }
});

// POST /api/signin
app.post('https://assignment-2-talal-rashid-23-pwbcs-1002.vercel.app/api/signin', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ name: username });
    if (!user) {
        return res.status(400).send('User not found');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).send('Incorrect password');
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '24h' });

    res.status(200).json({ message: 'Login successful', token });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.error('Authorization header missing');
        return res.status(403).send('Access denied: Missing token');
    }

    const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
    console.log('Token received:', token); // Debug log for token

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err.message); // Debug log for errors
            return res.status(403).send('Access denied: Invalid token');
        }
        req.user = decoded; // Attach decoded payload to request object
        next();
    });
};

// GET /api/protected
app.get('https://assignment-2-talal-rashid-23-pwbcs-1002.vercel.app/api/protected', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Protected route accessed', user: req.user });
});

// Server listening on port
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
