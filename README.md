Spotify Playlists App
Project Overview
This is a full-stack web application that allows users to securely log in with their Spotify account and view a list of their private and collaborative playlists. It demonstrates a complete authentication flow using OAuth 2.0 (via Spotify's API), JWT-based authorization, and a clear separation between frontend and backend concerns.

Live Demo (Coming Soon / Disclaimer)
A live demo of this application will be available here once deployed.

Important Note for Recruiters/Reviewers:
This application is currently awaiting approval from Spotify for "Production Mode." In Spotify's Development Mode, only users explicitly added to the application's "Users and Access" team can log in. If you wish to test the live deployed version, please contact me, and I can potentially add your Spotify account to the authorized users.

For an immediate and comprehensive demonstration of the application's functionality, please watch the video demo below.

Video Demo

(Replace YOUR_VIDEO_ID with the actual ID of your YouTube video. Click the image to watch!)

Features
Spotify OAuth 2.0 Integration: Secure user authentication via Spotify's authorization flow.

JWT-based Authorization: Backend uses JSON Web Tokens to manage user sessions and authorize requests to the Spotify API.

Token Refresh Mechanism: Handles expired Spotify access tokens by automatically requesting new ones using refresh tokens.

View User Playlists: Fetches and displays a list of the authenticated user's private and collaborative Spotify playlists.

Responsive UI: Built with React and styled using Bootstrap for a clean and adaptive user experience across devices.

Separate Frontend & Backend: Demonstrates a clean architectural separation between the client-side UI and the server-side logic.

Technologies Used
Backend (Demo_App)
Node.js: JavaScript runtime environment.

Express.js: Web application framework for Node.js.

jsonwebtoken: For creating and verifying JSON Web Tokens.

axios: Promise-based HTTP client for making requests to the Spotify API.

querystring: For parsing and stringifying URL query strings.

dotenv: For loading environment variables from a .env file.

cors: Express middleware for enabling Cross-Origin Resource Sharing.

Frontend (spotify-frontend)
React: JavaScript library for building user interfaces.

Vite: Fast frontend build tool.

TypeScript: Superset of JavaScript that adds static typing.

React-Bootstrap: Bootstrap components built for React.

jwt-decode: Utility to decode JWTs on the client side.

How to Run Locally
To run this project on your local machine, follow these steps:

Prerequisites
Node.js (LTS version recommended)

npm (Node Package Manager)

A Spotify Developer Account and a registered application.

Go to http://googleusercontent.com/developer.spotify.com/dashboard/applications

Create a new application.

In your application's settings, add http://localhost:4000/callback as a Redirect URI.

1. Backend Setup (Demo_App)
   Clone the backend repository:

git clone https://github.com/your-username/spotify-playlists-backend.git
cd spotify-playlists-backend # Or your Demo_App folder name

Install dependencies:

npm install

Create a .env file:
In the root of your spotify-playlists-backend (or Demo_App) directory, create a file named .env and add the following content. Replace the placeholder values with your actual Spotify API credentials and a strong JWT secret.

SPOTIFY_CLIENT_ID='YOUR_SPOTIFY_CLIENT_ID'
SPOTIFY_CLIENT_SECRET='YOUR_SPOTIFY_CLIENT_SECRET'
SPOTIFY_REDIRECT_URI='http://localhost:4000/callback'
FRONTEND_REDIRECT_URI='http://localhost:5173'
JWT_SECRET='YOUR_VERY_STRONG_AND_RANDOM_JWT_SECRET'

Start the backend servers:
Open two separate terminal windows in the spotify-playlists-backend (or Demo_App) directory.

Terminal 1 (Auth Server):

node authServer.js

(Should output: Auth server running on http://localhost:4000)

Terminal 2 (API Server):

node apiServer.js

(Should output: API server running on http://localhost:3000)

2. Frontend Setup (spotify-frontend)
   Clone the frontend repository (in a separate directory from your backend):

# Navigate to your desired projects directory, e.g., C:\Users\flori\Documents\ACC_Projects

cd C:\Users\flori\Documents\ACC_Projects
git clone https://github.com/your-username/spotify-playlists-frontend.git
cd spotify-playlists-frontend

Install dependencies:

npm install

Start the frontend development server:

npm run dev

(This will usually open your browser to http://localhost:5173)

Usage
Ensure both backend servers and the frontend server are running.

Open your browser to http://localhost:5173.

Click the "Login with Spotify" button.

You will be redirected to Spotify to authorize the application.

After authorization, you'll be redirected back to your app, and your playlists should be displayed.

API Endpoints
Backend (spotify-playlists-backend)
GET /login: Initiates the Spotify OAuth flow.

GET /callback: Handles the redirect from Spotify, exchanges the authorization code for tokens, and redirects to the frontend with a JWT.

POST /token: Refreshes an expired JWT using the Spotify refresh token.

GET /playlists: Fetches the authenticated user's Spotify playlists (protected by JWT authentication).

Challenges & Learnings
(This is a great section for you to personalize! Consider adding points like:)

OAuth 2.0 Flow: Understanding the intricacies of the Authorization Code Flow with PKCE (or similar).

JWT Implementation: Securely generating, signing, verifying, and refreshing JWTs.

CORS Configuration: Troubleshooting and resolving cross-origin issues between frontend and backend.

Environment Variables: Best practices for managing sensitive API keys.

API Integration: Handling responses and errors from external APIs (Spotify).

Full-Stack Architecture: Managing separate frontend and backend development workflows.

Future Enhancements
(What would you add if you had more time? Examples:)

Implement a "Logout" functionality that revokes the Spotify token.

Add search and filter capabilities for playlists.

Allow users to play snippets of songs from playlists.

Integrate other Spotify API features (e.g., top artists, recently played).

Improve error handling and user feedback.

Add unit and integration tests.

Contact
Your Name: [Your Name Here]

LinkedIn: [Link to your LinkedIn profile]

GitHub: [Link to your main GitHub profile]
