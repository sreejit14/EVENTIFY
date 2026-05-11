import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Homepage({ user, onLogout }) {
	const navigate = useNavigate();
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const [showCustomEvent, setShowCustomEvent] = useState(false);
	const [customEventName, setCustomEventName] = useState("");
	const [recommendedVendors, setRecommendedVendors] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedVendor, setSelectedVendor] = useState(null);
	const [showChat, setShowChat] = useState(false);
	const [cartItems, setCartItems] = useState([]);
	const [showCart, setShowCart] = useState(false);
	const [message, setMessage] = useState("");
	const [chatMessages, setChatMessages] = useState([]);
	const [messageSent, setMessageSent] = useState(false);

	const handleContactVendor = (vendor) => {
		setSelectedVendor(vendor);
		setShowChat(true);
		setMessage("");
		setChatMessages([]);
		setMessageSent(false);
	};

	const handleSendMessage = async () => {
		if (!message.trim()) return;

		try {
			const response = await fetch("http://localhost:5000/api/messages/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					vendorId: selectedVendor._id,
					userId: user?.id,
					message: message,
					eventName: customEventName
				}),
			});

			if (response.ok) {
				setChatMessages([...chatMessages, { text: message, sender: "user", timestamp: new Date() }]);
				setMessage("");
				setMessageSent(true);
				setTimeout(() => setMessageSent(false), 3000);
			}
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	const handleRemoveFromCart = (index) => {
		setCartItems(cartItems.filter((_, i) => i !== index));
	};

	const getEventRoute = (eventName) => {
		const normalizedEventName = eventName.toLowerCase();

		if (normalizedEventName.includes("wedding")) return "/wedding";
		if (normalizedEventName.includes("birthday")) return "/birthday";
		if (normalizedEventName.includes("meeting") || normalizedEventName.includes("corporate")) return "/meeting";
		if (normalizedEventName.includes("house") || normalizedEventName.includes("party")) return "/houseparty";

		return "/vendors";
	};

	const handleSelectEvent = () => {
		navigate(getEventRoute(customEventName));
	};

	return (
		<div className="App bg-white overflow-hidden">
			<div className="bg-[#40a8ed] w-full min-h-[70px] flex justify-between items-center px-4 relative">
				<Link to="/">
					<img alt="logo" src="/assets/event_logo.png" className="h-[72px] w-auto max-w-[240px] object-contain rounded-lg border-spacing-1"></img>
				</Link>
				<div className="relative">
					<button
						onClick={() => setShowProfileMenu(!showProfileMenu)}
						className="flex items-center space-x-2 hover:bg-blue-600 p-2 rounded-lg transition-colors"
					>
						<img alt="User Icon" src="/assets/pngegg.png" className="w-[30px] h-[30px]" />
						<span className="text-white text-sm">{user?.name}</span>
					</button>

					{showProfileMenu && (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
							<div className="py-1">
								<div className="px-4 py-2 text-sm text-gray-700 border-b">
									<div className="font-medium">{user?.name}</div>
									<div className="text-gray-500">{user?.email}</div>
								</div>
								<button
									onClick={() => {
										navigate("/bookings");
										setShowProfileMenu(false);
									}}
									className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									My Bookings
								</button>
								<button
									onClick={() => {
										onLogout();
										setShowProfileMenu(false);
									}}
									className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									Logout
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="mt-0 w-full bg-[#40a8ed] min-h-screen p-4">
				<h1 className="text-2xl sm:text-3xl text-white font-semibold text-center pt-4 pb-8">
					What are you planning for?
				</h1>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
					<div className="flex-col border-2 border-white rounded-2xl p-4 shadow-2xl bg-white">
						<Link to="/wedding">
							<img
								src="/assets/wedding.svg"
								alt="wedding icon"
								className="w-full h-auto max-w-[160px] mx-auto"
							/>
							<h1 className="font-semibold text-center bg-gray-100 mt-2 p-2 rounded-2xl">
								Wedding
							</h1>
						</Link>
					</div>
					<div className="flex-col border-2 border-white rounded-2xl p-4 shadow-2xl bg-white">
						<Link to="/birthday">
							<img
								src="/assets/birthday-cake.png"
								alt="birthday icon"
								className="w-full h-auto max-w-[160px] mx-auto"
							/>
							<h1 className="font-semibold text-center bg-gray-100 mt-2 p-2 rounded-2xl">
								Birthday
							</h1>
						</Link>
					</div>
					<div className="flex-col border-2 border-white rounded-2xl p-4 shadow-2xl bg-white">
						<Link to="/meeting">
							<img
								src="/assets/conversation.png"
								alt="meeting icon"
								className="w-full h-auto max-w-[160px] mx-auto"
							/>
							<h1 className="font-semibold text-center bg-gray-100 mt-2 p-2 rounded-2xl">
								Meeting
							</h1>
						</Link>
					</div>
					<div className="flex-col border-2 border-white rounded-2xl p-4 shadow-2xl bg-white">
						<Link to="/houseparty">
							<img
								src="/assets/christmas-music.png"
								alt="house party icon"
								className="w-full h-auto max-w-[160px] mx-auto"
							/>
							<h1 className="font-semibold text-center bg-gray-100 mt-2 p-2 rounded-2xl">
								House Party
							</h1>
						</Link>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
					<div
						className="bg-white flex items-center justify-center h-[60px] rounded-2xl shadow-2xl cursor-pointer hover:bg-gray-50 transition-colors"
						onClick={() => setShowCustomEvent(true)}
					>
						<h1 className="font-bold text-lg mr-4">Custom Event</h1>
						<img src="/assets/button.png" alt="More" className="w-[50px] h-[50px]" />
					</div>
					<Link
						to="/vendors"
						className="bg-white flex items-center justify-center h-[60px] rounded-2xl shadow-2xl cursor-pointer hover:bg-gray-50 transition-colors"
					>
						<h1 className="font-bold text-lg mr-4">All Vendors</h1>
						<img src="/assets/button.png" alt="Vendors" className="w-[50px] h-[50px]" />
					</Link>
				</div>
			</div>

			{/* Custom Event Modal */}
			{showCustomEvent && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold text-gray-800">Plan Your Custom Event</h2>
							<button
								onClick={() => {
									setShowCustomEvent(false);
									setCustomEventName("");
									setRecommendedVendors([]);
								}}
								className="text-gray-500 hover:text-gray-700 text-2xl"
							>
								✕
							</button>
						</div>

						<div className="mb-6">
							<label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
								Event Name
							</label>
							<input
								type="text"
								id="eventName"
								value={customEventName}
								onChange={(e) => setCustomEventName(e.target.value)}
								placeholder="Enter your event name (e.g., Anniversary, Graduation, Corporate Party)"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="flex space-x-4 mb-6">
							<button
								onClick={async () => {
									if (!customEventName.trim()) return;

									setLoading(true);
									try {
										const response = await fetch("http://localhost:5000/api/vendors/recommend", {
											method: "POST",
											headers: {
												"Content-Type": "application/json",
											},
											body: JSON.stringify({ eventType: "custom" }),
										});

										if (response.ok) {
											const vendors = await response.json();
											setRecommendedVendors(vendors);
										}
									} catch (error) {
										console.error("Error fetching vendors:", error);
									} finally {
										setLoading(false);
									}
								}}
								disabled={loading || !customEventName.trim()}
								className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
							>
								{loading ? "Getting Recommendations..." : "Get Vendor Recommendations"}
							</button>
						</div>

						{recommendedVendors.length > 0 && (
							<div>
								<h3 className="text-lg font-semibold mb-4">Recommended Vendors for "{customEventName}"</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{recommendedVendors.map((vendor, index) => (
										<div key={index} className="bg-white rounded-lg p-4 border shadow-sm">
											<h4 className="font-medium text-gray-800 mb-2">{vendor.name}</h4>
											<p className="text-sm text-gray-600 mb-3">{vendor.description}</p>
											<div className="text-xs text-gray-500 space-y-1 mb-4">
												<p>Category: {vendor.category}</p>
												<p>Rating: ⭐ {vendor.rating}/5</p>
												<p>Price: {vendor.priceRange}</p>
												<p>Contact: {vendor.contact}</p>
											</div>
											<div className="flex space-x-2">
												<button
													onClick={() => handleContactVendor(vendor)}
													className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md font-medium text-sm transition-colors"
												>
													Message Vendor
												</button>
												<button
													onClick={handleSelectEvent}
													className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md font-medium text-sm transition-colors"
												>
													Select Event
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Chat Box */}
			{showChat && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Chat with {selectedVendor?.name}</h3>
							<button
								onClick={() => setShowChat(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								✕
							</button>
						</div>
						<div className="h-64 bg-gray-100 rounded p-4 mb-4 overflow-y-auto">
							<p className="text-gray-600 mb-4">Welcome to our chat! How can we help you with your event planning?</p>
							{chatMessages.map((msg, index) => (
								<div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
									<div className={`inline-block p-2 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"}`}>
										{msg.text}
									</div>
								</div>
							))}
						</div>
						{messageSent && (
							<div className="mb-4 p-2 bg-green-100 text-green-800 rounded text-center">
								Message sent successfully!
							</div>
						)}
						<div className="flex">
							<input
								type="text"
								placeholder="Type your message..."
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
								className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<button
								onClick={handleSendMessage}
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
							>
								Send
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Cart Icon */}
			{cartItems.length > 0 && (
				<div
					className="fixed bottom-4 right-4 bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg cursor-pointer hover:bg-green-700 transition-colors"
					onClick={() => setShowCart(true)}
				>
					🛒
					<span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
						{cartItems.length}
					</span>
				</div>
			)}


			{/* Cart Sidebar */}
			{showCart && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
					<div className="bg-white w-full max-w-md h-full overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
								<button
									onClick={() => setShowCart(false)}
									className="text-gray-500 hover:text-gray-700 text-2xl"
								>
									✕
								</button>
							</div>

							{/* Cart Items */}
							{cartItems.length > 0 ? (
								<div className="space-y-3 mb-6">
									{cartItems.map((item, index) => (
										<div key={index} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
											<div>
												<h4 className="font-medium text-gray-800">{item.name}</h4>
												<p className="text-sm text-gray-600">{item.priceRange}</p>
												<p className="text-xs text-gray-500">{item.category}</p>
											</div>
											<button
												onClick={() => handleRemoveFromCart(index)}
												className="text-red-500 hover:text-red-700"
											>
												🗑️
											</button>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<p className="text-gray-500">Your cart is empty</p>
								</div>
							)}

							{cartItems.length > 0 && (
								<div className="mt-8">
									<button
										onClick={() => {
											alert(`Checkout functionality would be implemented here. Total items: ${cartItems.length}`);
											setShowCart(false);
										}}
										className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
									>
										Proceed to Checkout ({cartItems.length} items)
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Homepage;
