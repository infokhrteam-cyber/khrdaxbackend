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

app.post('/api/submit-handle', async (req, res) => {
    try {
        const response = await axios.post(`${BASE_URL}/socials`, {
            platform: "YouTube",
            username: req.body.username
        }, { headers: getHeaders() });
        res.status(200).json(response.data); 
    } catch (error) {
        res.status(500).json({ error: 'Handle submit fail ho gaya' });
    }
});

app.post('/api/verify-handle', async (req, res) => {
    try {
        const response = await axios.post(`${BASE_URL}/socials/${req.body.website_a_id}/verify`, {}, { 
            headers: getHeaders() 
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Verify fail ho gaya' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
module.exports = app;
