import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventifyHeader from "../components/EventifyHeader";

function HouseParty() {
	const navigate = useNavigate();
	const [selectedVenue, setSelectedVenue] = useState("");
	const [selectedFood, setSelectedFood] = useState("");
	const [selectedEntertainment, setSelectedEntertainment] = useState("");
	const [numPersons, setNumPersons] = useState("");
	const [estimate, setEstimate] = useState(null);

	const venuePrices = {
		home: 8000,
		backyard: 15000,
		rented: 30000,
		lounge: 50000,
	};

	const foodPrices = {
		fingerfood: 500,
		bbq: 900,
		delivery: 350,
		catring: 1200,
	};

	const entertainmentPrices = {
		music: 5000,
		dj: 18000,
		games: 4000,
		full: 30000,
	};

	const calculateEstimate = () => {
		const guestCount = Math.max(1, parseInt(numPersons || "1", 10));
		const venuePrice = selectedVenue ? venuePrices[selectedVenue] : 0;
		const foodPerPerson = selectedFood ? foodPrices[selectedFood] : 0;
		const entertainmentPrice = selectedEntertainment
			? entertainmentPrices[selectedEntertainment]
			: 0;
		const totalEstimate =
			venuePrice +
			entertainmentPrice +
			(foodPerPerson * guestCount) +
			Math.round(guestCount * 100);
		setEstimate(totalEstimate);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-200 text-gray-800">
			<EventifyHeader />
			<div className="max-w-6xl mx-auto py-10 px-5">
				<h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-purple-900">
					Plan Your House Party
				</h1>

				<div className="mb-8">
					<div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 max-w-md mx-auto">
						<h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
							Number of Guests
						</h2>
						<p className="text-gray-600 mb-6 text-center">
							How many people will attend your house party?
						</p>
						<input
							type="number"
							min="1"
							className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-gray-400 focus:border-transparent text-center"
							onChange={(e) => setNumPersons(e.target.value)}
							value={numPersons}
							placeholder="Enter number of guests"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
						<h2 className="text-2xl font-semibold mb-4 text-purple-700">
							Venue Setup
						</h2>
						<p className="text-gray-600 mb-6">
							Choose how to set up your party space
						</p>
						<select
							className="w-full bg-purple-50 border border-purple-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
							onChange={(e) => setSelectedVenue(e.target.value)}
							value={selectedVenue}>
							<option value="">Choose setup...</option>
							<option value="home">Home Interior - Cozy atmosphere</option>
							<option value="backyard">Backyard - Outdoor fun</option>
							<option value="rented">Rented Space - Bigger party</option>
							<option value="lounge">Lounge Area - Stylish vibe</option>
						</select>
					</div>

					<div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
						<h2 className="text-2xl font-semibold mb-4 text-green-700">
							Food & Drinks
						</h2>
						<p className="text-gray-600 mb-6">
							Select food and beverage arrangements
						</p>
						<select
							className="w-full bg-green-50 border border-green-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-transparent"
							onChange={(e) => setSelectedFood(e.target.value)}
							value={selectedFood}>
							<option value="">Choose food...</option>
							<option value="fingerfood">Finger Foods - Easy snacks</option>
							<option value="bbq">BBQ Setup - Casual cooking</option>
							<option value="delivery">Food Delivery - Restaurant style</option>
							<option value="catring">
								Full Catering - Professional service
							</option>
						</select>
					</div>

					<div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
						<h2 className="text-2xl font-semibold mb-4 text-blue-700">
							Entertainment
						</h2>
						<p className="text-gray-600 mb-6">
							Choose music and entertainment options
						</p>
						<select
							className="w-full bg-blue-50 border border-blue-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
							onChange={(e) => setSelectedEntertainment(e.target.value)}
							value={selectedEntertainment}>
							<option value="">Choose entertainment...</option>
							<option value="music">Music System - Background tunes</option>
							<option value="dj">Professional DJ - Party energy</option>
							<option value="games">
								Games & Activities - Interactive fun
							</option>
							<option value="full">
								Full Entertainment Package - Complete experience
							</option>
						</select>
					</div>
				</div>

				<div className="text-center mt-12">
					<button
						onClick={calculateEstimate}
						className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
						Get Estimate
					</button>

					{estimate !== null && (
						<div className="mt-8 space-y-6">
							<div className="p-6 bg-white rounded-2xl shadow-xl max-w-md mx-auto">
								<h2 className="text-3xl font-bold text-green-700 mb-4">
									Estimated Cost
								</h2>
								<p className="text-2xl text-gray-800">
									₹{estimate.toLocaleString("en-IN")}
								</p>
							</div>
							<button
								onClick={() => navigate("/vendors", { state: { estimate, eventRoute: "/houseparty" } })}
								className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
								View Recommended Vendors
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default HouseParty;
