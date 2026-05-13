import React, { useState } from "react";
import axios from "axios";
import eventLogo from "./assets/event_logo.png";

function Login({ onLogin }) {
    const [email, setEmail]         = useState("");
    const [password, setPassword]   = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName]           = useState("");
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // ✅ Added: frontend validation before hitting the server
        if (!email || !password || (isRegister && !name)) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        try {
            const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
            const payload  = isRegister
                ? { email: email.toLowerCase(), password, name }
                : { email: email.toLowerCase(), password };

            // axios.defaults.baseURL in App.js points this to Render automatically
            const response = await axios.post(endpoint, payload);

            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                onLogin(response.data.user);
            }
        } catch (err) {
            console.error("Auth error:", err.response || err);
            const message = err.response?.data?.message || "Server error. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 flex text-white items-center justify-center px-4">
            <div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="w-full h-52 rounded-lg bg-zinc-700 overflow-hidden mb-6">
                    <img className="w-full h-full object-cover" src={eventLogo} alt="Event Logo" />
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-600/20 border border-red-600 text-red-200 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <div className="mb-4">
                            <label className="block text-zinc-400 text-sm mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-zinc-400 text-sm mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-zinc-400 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 font-medium"
                    >
                        {loading ? "Processing..." : (isRegister ? "Create Account" : "Sign In")}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError("");
                        }}
                        className="text-zinc-400 hover:text-white text-sm transition"
                    >
                        {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;
