const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
app.use(express.json());

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

let userTokens = {}; // Store tokens temporarily

// Step 1: Redirect user to Spotify for authentication
app.get('/login', (req, res) => {
    const scope = 'playlist-read-private playlist-read-collaborative';
    const authUrl = `${SPOTIFY_AUTH_URL}?${querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope
    })}`;
    res.redirect(authUrl);
});

// Step 2: Handle Spotify callback and exchange code for token
// Step 2: Handle Spotify callback and exchange code for token
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const response = await axios.post(SPOTIFY_TOKEN_URL, querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const { access_token, refresh_token, expires_in } = response.data;
        const expiration = Date.now() + expires_in * 1000;

        console.log("Access Token:", access_token);
        console.log("Refresh Token:", refresh_token);
        console.log("Expiration Time:", expiration);

        const token = jwt.sign({ access_token, refresh_token, expiration }, JWT_SECRET);
        userTokens = { token };

        // >>>>>> THIS IS THE CORRECT REDIRECT <<<<<<
        const FRONTEND_REDIRECT_URI = process.env.FRONTEND_REDIRECT_URI || 'http://localhost:5173';
        res.redirect(`${FRONTEND_REDIRECT_URI}?jwt=${token}`);

    } catch (error) {
        console.error(error);
        res.status(400).send('Error authenticating');
    }
});

// Step 3: Token refresh endpoint
app.post('/token', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).send('Missing token');
    
    let decoded;
    try {
        // Decode the JWT to retrieve the access_token, refresh_token, and expiration
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(400).send('Invalid or expired JWT');
    }

    // Check if the decoded token has expired
    if (decoded.expiration < Date.now()) {
        return res.status(403).send('JWT has expired');
    }

    if (!decoded.refresh_token) return res.status(403).send('No refresh token found');

    // Send a request to Spotify to refresh the access token
    try {
        const response = await axios.post(SPOTIFY_TOKEN_URL, querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: decoded.refresh_token,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        decoded.access_token = response.data.access_token;
        decoded.expiration = Date.now() + response.data.expires_in * 1000; // Update expiration time

        const newToken = jwt.sign(decoded, JWT_SECRET); // Generate a new JWT
        userTokens.token = newToken; // Store the new token

        res.json({ jwt: newToken }); // Return new JWT
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(400).send('Error refreshing token');
    }
});

app.listen(4000, () => console.log('Auth server running on http://localhost:4000'));
