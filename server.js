const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://app.freeclipping.com', // Jo origin logs mein hai
    credentials: true
}));
app.use(express.json());

// JWT Authentication Middleware (Token check karne ke liye)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ message: 'Access Token Missing' });

    // Agar real JWT verify karna ho to secret key use karein. 
    // Testing/Mocking ke liye aap isey bypass ya decode bhi kar sakte hain.
    jwt.verify(token, process.env.JWT_SECRET || 'your_temporary_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
        req.user = user;
        next();
    });
};

// 1. GET: Fetch User Socials
app.get('/api/user/socials', authenticateToken, (req, res) => {
    // Mock Data jo user ko return hona hai
    const mockSocials = [
        { id: 8165, platform: 'Facebook', status: 'pending' },
        { id: 8166, platform: 'Twitter', status: 'verified' }
    ];
    
    // ETag header set karna Express khud handle kar leta hai jo 304 status deta hai
    res.json(mockSocials);
});

// 2. POST: Verify Specific Social Account
app.post('/api/user/socials/:id/verify', authenticateToken, (req, res) => {
    const socialId = req.params.id;

    // Logs ke mutabiq response length 116 bytes ke aas paas hai, toh data structure aisa ho sakta hai:
    res.status(200).json({
        success: true,
        message: `Social account with ID ${socialId} verified successfully.`,
        verifiedAt: new Date().toISOString()
    });
});

// Root Route for Health Check
app.get('/', (req, res) => {
    res.send('Website A Backend Server is running perfectly!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
