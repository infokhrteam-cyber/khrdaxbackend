const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = 'https://app.freeclipping.com/api/user';
const getHeaders = () => ({
  'accept': '*/*',
  'authorization': `Bearer ${process.env.WEBSITE_A_TOKEN}`,
  'content-type': 'application/json',
  'origin': 'https://app.freeclipping.com',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/148.0.0.0 Safari/537.36'
});

// 1. SUBMIT HANDLE ROUTE
app.post('/api/submit-handle', async (req, res) => {
    try {
        console.log(`[KHR] Submitting handle to Website A: ${req.body.username}`);
        const response = await axios.post(`${BASE_URL}/socials`, {
            platform: "YouTube",
            username: req.body.username
        }, { headers: getHeaders() });
        
        res.status(200).json(response.data); 
    } catch (error) {
        console.error('[KHR Error] Submit Handle Fail:', error.response?.data || error.message);
        
        // Agar Website A koi error response deti hai (jaise channel already linked), toh use frontend ko forward karein
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: 'Handle submit fail ho gaya backend par' });
    }
});

// 2. VERIFY HANDLE ROUTE
app.post('/api/verify-handle', async (req, res) => {
    try {
        console.log(`[KHR] Verifying website_a_id: ${req.body.website_a_id}`);
        const response = await axios.post(`${BASE_URL}/socials/${req.body.website_a_id}/verify`, {}, { 
            headers: getHeaders() 
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('[KHR Error] Verify Handle Fail:', error.response?.data || error.message);
        
        // CRITICAL FIX: Website A jab verification fail karti hai toh 400 status bhejti hai.
        // Agar hum yahan se 500 bhejenge toh frontend ka res.ok false ho jayega aur custom alert block chalega.
        // Isliye hum status 200 ke sath success: false aur live exact error message bhejenge jo Website A ne diya hai.
        if (error.response) {
            const liveApiError = error.response.data?.message || error.response.data?.error || 'Verification failed on Website A';
            return res.status(200).json({ 
                success: false, 
                verified: false, 
                error: liveApiError 
            });
        }
        res.status(500).json({ success: false, verified: false, error: 'Verify fail ho gaya backend par' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
module.exports = app;
