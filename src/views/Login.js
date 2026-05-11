import React, { useState } from "react";
import eventLogo from "./assets/event_logo.png";

function Login({ onLogin }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isRegister, setIsRegister] = useState(false);
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
			const body = isRegister
				? { email, password, name }
				: { email, password };

			const response = await fetch(`http://localhost:5000${endpoint}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem("token", data.token);
				localStorage.setItem("user", JSON.stringify(data.user));
				onLogin(data.user);
			} else {
				setError(data.message);
			}
		} catch (err) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-zinc-900 flex text-white items-center justify-center px-4">
			<div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md">
				<div className="w-full h-52 rounded-lg bg-zinc-700 overflow-hidden">
                    <img className="w-full h-full object-cover" src={eventLogo} alt="Event Logo" ></img>
                </div>
				{error && (
					<div className="mb-4 p-3 bg-red-600 text-white rounded-md">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					{isRegister && (
						<div className="mb-4">
							<label htmlFor="name" className="block text-zinc-400">
								Name
							</label>
							<input
								type="text"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
					)}
					<div className="mb-4">
						<label htmlFor="email" className="block text-zinc-400">
							Email
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div className="mb-6">
						<label htmlFor="password" className="block text-zinc-400">
							Password
						</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition duration-200 disabled:opacity-50">
						{loading ? "Please wait..." : (isRegister ? "Register" : "Login")}
					</button>
				</form>
				<p className="text-center text-zinc-500 mt-4">
					{isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
					<button
						type="button"
						onClick={() => {
							setIsRegister(!isRegister);
							setError("");
							setName("");
							setEmail("");
							setPassword("");
						}}
						className="text-blue-600 hover:underline"
					>
						{isRegister ? "Login" : "Sign up"}
					</button>
				</p>
			</div>
		</div>
	);
}

export default Login;
