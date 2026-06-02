const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// API_BASE_URL ko environment variable se uthayenge
const BASE_URL = process.env.API_BASE_URL || 'https://app.freeclipping.com/api/user';

const getHeaders = () => ({
  'accept': '*/*',
  'authorization': `Bearer ${process.env.API_TOKEN}`, // Yahan generic token use hoga
  'content-type': 'application/json'
});

app.post('/api/submit-handle', async (req, res) => {
    try {
        const response = await axios.post(`${BASE_URL}/socials`, {
            platform: "YouTube",
            username: req.body.username
        }, { headers: getHeaders() });
        res.status(200).json(response.data); 
    } catch (error) {
        res.status(500).json({ error: 'Handle submit fail' });
    }
});

app.post('/api/verify-handle', async (req, res) => {
    try {
        // req.body se dynamic ID uthayenge
        const response = await axios.post(`${BASE_URL}/socials/${req.body.id}/verify`, {}, { 
            headers: getHeaders() 
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Verify fail' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
module.exports = app;
