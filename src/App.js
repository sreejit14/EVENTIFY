import axios from 'axios';
import "./stylesheets/App.css";
import "./stylesheets/index.css";
// ✅ Fixed: removed import "./index.js" — circular import, causes crash
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/Login";
import Homepage from "./views/Homepage";
import Wedding from "./views/Wedding";
import Birthday from "./views/Birthday";
import Meeting from "./views/Meeting";
import HouseParty from "./views/HouseParty";
import Vendors from "./views/Vendors";
import Bookings from "./views/Bookings";

// ✅ Added: single base URL — swap this when deploying to Vercel+Render
// In production, set REACT_APP_API_URL in Vercel environment variables
// to your Render backend URL e.g. https://your-app-backend.onrender.com
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true); // ✅ Added: prevent flash of Login on refresh

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = response.data;
        localStorage.setItem("user", JSON.stringify(profile));
        setUser(profile);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Session expired or invalid token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false); // ✅ Always stop loading whether success or fail
      }
    };

    verifyToken();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  // ✅ Added: show nothing while verifying token (prevents Login flash on refresh)
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  return (
    // ✅ Fixed: BrowserRouter must wrap everything — moved outside the conditional
    // so direct URL visits like /bookings work correctly when logged in
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* ✅ If not logged in, all routes redirect to Login */}
          {!isLoggedIn ? (
            <>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*"      element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/"           element={<Homepage user={user} onLogout={handleLogout} />} />
              <Route path="/wedding"    element={<Wedding />} />
              <Route path="/birthday"   element={<Birthday />} />
              <Route path="/meeting"    element={<Meeting />} />
              <Route path="/houseparty" element={<HouseParty />} />
              <Route path="/vendors"    element={<Vendors />} />
              <Route path="/bookings"   element={<Bookings user={user} />} />
              {/* Redirect unknown routes to home */}
              <Route path="*"           element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
