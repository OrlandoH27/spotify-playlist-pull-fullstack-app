// src/App.tsx
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./index.css";

// Import Bootstrap components
import {
  Container,
  Button,
  Card,
  ListGroup,
  Alert,
  Spinner,
} from "react-bootstrap";

// Define the base URLs for your backend servers
const AUTH_SERVER_BASE_URL = "http://localhost:4000";
const API_SERVER_BASE_URL = "http://localhost:3000";

// --- TypeScript Interfaces for Spotify Data ---
interface Image {
  url: string;
  height: number | null;
  width: number | null;
}

interface Playlist {
  id: string;
  name: string;
  images: Image[];
  tracks: {
    href: string; // Add href for tracks object if it exists in Spotify API
    total: number;
  };
  // Add other properties from Spotify Playlist Object if needed, e.g.:
  // description: string;
  // external_urls: { spotify: string; };
  // owner: { display_name: string; };
  // public: boolean;
}

function App() {
  // State for JWT (can be string or null if not logged in)
  const [jwt, setJwt] = useState<string | null>(
    localStorage.getItem("spotify_jwt")
  );
  // State for playlists (array of Playlist objects, or empty array)
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  // State for loading status
  const [loading, setLoading] = useState<boolean>(false);
  // State for error messages (can be string or null)
  const [error, setError] = useState<string | null>(null);
  // State for general messages (can be string)
  const [message, setMessage] = useState<string>("");

  // Effect to handle JWT from the URL query parameter after Spotify redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtFromUrl = urlParams.get("jwt");

    if (jwtFromUrl) {
      localStorage.setItem("spotify_jwt", jwtFromUrl);
      setJwt(jwtFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      setMessage("Successfully logged in!");
    }
  }, []);

  // Function to initiate the Spotify login process
  const handleLogin = (): void => {
    window.location.href = `${AUTH_SERVER_BASE_URL}/login`;
  };

  // Function to fetch user's Spotify playlists from your backend
  const fetchPlaylists = async (currentJwt: string): Promise<void> => {
    if (!currentJwt) {
      setError("No JWT found. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage("");

    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/playlists`, {
        headers: {
          Authorization: `Bearer ${currentJwt}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setMessage("Token expired or invalid. Attempting to refresh...");
          const refreshed = await refreshAccessToken(currentJwt);
          if (refreshed) {
            setMessage(
              "Token refreshed successfully. Retrying playlist fetch..."
            );
            const newJwt = localStorage.getItem("spotify_jwt");
            if (newJwt) {
              await fetchPlaylists(newJwt); // Retry with new token
            } else {
              setError("Refreshed token not found. Please log in again.");
              setJwt(null);
              localStorage.removeItem("spotify_jwt");
            }
          } else {
            setError("Failed to refresh token. Please log in again.");
            setJwt(null);
            localStorage.removeItem("spotify_jwt");
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        // Assuming Spotify API returns a structure where playlists are in 'items'
        setPlaylists(data.items || []);
        setMessage("Playlists fetched successfully!");
      }
    } catch (err: any) {
      // Use 'any' for catch error if specific type is unknown/complex
      console.error("Error fetching playlists:", err);
      setError(`Failed to fetch playlists: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh the access token using your backend's /token endpoint
  const refreshAccessToken = async (oldJwt: string): Promise<boolean> => {
    try {
      const response = await fetch(`${AUTH_SERVER_BASE_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: oldJwt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { jwt?: string } = await response.json(); // Expect 'jwt' in response
      if (data.jwt) {
        localStorage.setItem("spotify_jwt", data.jwt);
        setJwt(data.jwt);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Error refreshing token:", err);
      setError(`Failed to refresh token: ${err.message || "Unknown error"}`);
      return false;
    }
  };

  // Effect to automatically fetch playlists when the JWT state changes
  useEffect(() => {
    if (jwt) {
      fetchPlaylists(jwt);
    }
  }, [jwt]);

  // Function to handle user logout
  const handleLogout = (): void => {
    setJwt(null);
    setPlaylists([]);
    localStorage.removeItem("spotify_jwt");
    setMessage("Logged out.");
    setError(null);
  };

  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-dark text-white p-4"
    >
      <h1 className="text-success mb-4 text-center">Spotify Playlists App</h1>

      {!jwt ? (
        <Button
          variant="success"
          size="lg"
          onClick={handleLogin}
          className="shadow-lg"
        >
          Login with Spotify
        </Button>
      ) : (
        <Card
          bg="dark"
          text="white"
          className="w-100"
          style={{ maxWidth: "600px" }}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Card.Text className="text-muted small">
                Your JWT:{" "}
                <code className="text-break">{jwt.substring(0, 30)}...</code>
              </Card.Text>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            {message && <Alert variant="info">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Button
              variant="primary"
              onClick={() => fetchPlaylists(jwt)}
              disabled={loading}
              className="mb-4"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Loading Playlists...
                </>
              ) : (
                "Fetch Playlists"
              )}
            </Button>

            {playlists.length > 0 && (
              <div>
                <h2 className="text-success mb-3">Your Playlists:</h2>
                <ListGroup variant="flush">
                  {playlists.map(
                    (
                      playlist: Playlist // Explicitly type playlist in map
                    ) => (
                      <ListGroup.Item
                        key={playlist.id}
                        className="d-flex align-items-center bg-secondary text-white rounded mb-2"
                      >
                        {playlist.images && playlist.images.length > 0 && (
                          <img
                            src={playlist.images[0].url}
                            alt={playlist.name}
                            className="rounded me-3"
                            style={{
                              width: "64px",
                              height: "64px",
                              objectFit: "cover",
                            }}
                            onError={(
                              e: React.SyntheticEvent<HTMLImageElement, Event>
                            ) => {
                              // Type the event
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://placehold.co/64x64/333333/FFFFFF?text=No+Image`;
                            }}
                          />
                        )}
                        <div>
                          <h5 className="mb-0">{playlist.name}</h5>
                          <p className="text-muted mb-0">
                            {playlist.tracks.total} songs
                          </p>
                        </div>
                      </ListGroup.Item>
                    )
                  )}
                </ListGroup>
              </div>
            )}
            {playlists.length === 0 && !loading && !error && jwt && (
              <p className="text-muted">
                No playlists found or not yet fetched.
              </p>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default App;
