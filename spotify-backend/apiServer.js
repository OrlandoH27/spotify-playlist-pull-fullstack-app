// apiServer.js
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173'
}));

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate requests using JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send('Not logged in');

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
};

// Step 3: Fetch user's Spotify playlists
app.get('/playlists', authenticateToken, async (req, res) => {
    try {
        const accessToken = req.user.access_token; // Extracted from JWT
        const response = await axios.get(`${SPOTIFY_API_BASE_URL}/me/playlists`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        res.send(response.data);
    } catch (error) {
        res.status(400).send('Error fetching playlists');
    }
});

app.listen(3000, () => console.log('API server running on http://localhost:3000'));
