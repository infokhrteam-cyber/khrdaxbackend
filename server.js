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

// 1. SUBMIT HANDLE ROUTE (WITH AUTOMATIC UNIQUE CODE EXTRACTION)
app.post('/api/submit-handle', async (req, res) => {
    try {
        const submittedHandle = req.body.username ? req.body.username.toLowerCase().trim() : '';
        console.log(`[KHR] Submitting handle to Website A Master Account: ${submittedHandle}`);
        
        const response = await axios.post(`${BASE_URL}/socials`, {
            platform: "YouTube",
            username: req.body.username
        }, { headers: getHeaders() });
        
        let responseData = response.data;
        let matchedSocial = null;
        
        // FOOLPROOF RECURSIVE SEARCH: Response mein jahan bhi handle match hoga, yeh use dhoond nikalega
        function findSpecificHandle(obj) {
            if (!obj || typeof obj !== 'object') return;
            
            if (Array.isArray(obj)) {
                for (let item of obj) {
                    if (item && typeof item === 'object') {
                        const currentName = (item.username || item.handle || item.youtube_handle || '').toLowerCase().trim();
                        if (currentName === submittedHandle) {
                            matchedSocial = item;
                            return;
                        }
                        findSpecificHandle(item);
                    }
                }
            } else {
                const currentName = (obj.username || obj.handle || obj.youtube_handle || '').toLowerCase().trim();
                if (currentName === submittedHandle && (obj.id || obj.verification_code || obj.code || obj.verification_string)) {
                    matchedSocial = obj;
                    return;
                }
                for (let key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === 'object') {
                        findSpecificHandle(obj[key]);
                        if (matchedSocial) return;
                    }
                }
            }
        }
        
        // Search execution
        findSpecificHandle(responseData);
        
        // Agar specific handle ka unique data mil gaya, toh use root par overwrite karein taaki App.tsx sahi read kare
        if (matchedSocial) {
            console.log(`[KHR] Successfully matched unique data for handle: ${submittedHandle}`);
            const uniqueId = matchedSocial.id;
            const uniqueCode = matchedSocial.verification_code || matchedSocial.code || matchedSocial.verification_string || matchedSocial.verificationCode;
            
            if (uniqueId) responseData.id = uniqueId;
            if (uniqueCode) {
                responseData.verification_string = uniqueCode;
                responseData.code = uniqueCode;
                responseData.verification_code = uniqueCode;
                responseData.verificationCode = uniqueCode;
            }
        }
        
        res.status(200).json(responseData); 
    } catch (error) {
        console.error('[KHR Error] Submit Handle Fail:', error.response?.data || error.message);
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: 'Handle submit fail ho gaya' });
    }
});

// 2. VERIFY HANDLE ROUTE
app.post('/api/verify-handle', async (req, res) => {
    try {
        console.log(`[KHR] Verifying specific channel ID: ${req.body.website_a_id}`);
        const response = await axios.post(`${BASE_URL}/socials/${req.body.website_a_id}/verify`, {}, { 
            headers: getHeaders() 
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('[KHR Error] Verify Handle Fail:', error.response?.data || error.message);
        
        // Live verification status check code mapping
        if (error.response) {
            const liveApiError = error.response.data?.message || error.response.data?.error || 'Verification failed on Website A';
            return res.status(200).json({ 
                success: false, 
                verified: false, 
                error: liveApiError 
            });
        }
        res.status(500).json({ success: false, verified: false, error: 'Verify fail ho gaya' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
module.exports = app;
