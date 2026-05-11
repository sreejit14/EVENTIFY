import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventifyHeader from "../components/EventifyHeader";

function Wedding() {
	const navigate = useNavigate();
	const [selectedVenue, setSelectedVenue] = useState("");
	const [selectedCatering, setSelectedCatering] = useState("");
	const [selectedDecorations, setSelectedDecorations] = useState("");
	const [numPersons, setNumPersons] = useState("");
	const [estimate, setEstimate] = useState(null);

	const venuePrices = {
		garden: 350000,
		beach: 900000,
		ballroom: 1200000,
		hotel: 600000,
		barn: 250000,
	};

	const cateringPrices = {
		italian: 2200,
		indian: 1400,
		seafood: 2600,
		vegetarian: 1100,
		buffet: 1000,
		plated: 1800,
	};

	const decorationPrices = {
		floral: 120000,
		lightning: 150000,
		balloon: 40000,
		drapery: 80000,
		stage: 250000,
		themed: 180000,
	};

	const calculateEstimate = () => {
		const guestCount = Math.max(1, parseInt(numPersons || "1", 10));
		const venuePrice = selectedVenue ? venuePrices[selectedVenue] : 0;
		const cateringPerPerson = selectedCatering ? cateringPrices[selectedCatering] : 0;
		const decorationPrice = selectedDecorations
			? decorationPrices[selectedDecorations]
			: 0;
		const logisticsAndService = Math.round((venuePrice + decorationPrice) * 0.12);
		const totalEstimate =
			venuePrice +
			decorationPrice +
			(cateringPerPerson * guestCount) +
			logisticsAndService;
		setEstimate(totalEstimate);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 text-gray-800">
			<EventifyHeader />
			<div className="max-w-6xl mx-auto py-10 px-5">
				<h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-pink-900">
					Plan Your Dream Wedding
				</h1>

				<div className="mb-8">
					<div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 max-w-md mx-auto">
						<h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
							Number of Guests
						</h2>
						<p className="text-gray-600 mb-6 text-center">
							How many guests will attend your wedding?
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
						<h2 className="text-2xl font-semibold mb-4 text-indigo-700">
							Venues
						</h2>
						<p className="text-gray-600 mb-6">
							Browse and select from available wedding venues
						</p>
						<select
							className="w-full bg-indigo-50 border border-indigo-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
							onChange={(e) => setSelectedVenue(e.target.value)}
							value={selectedVenue}>
							<option value="">Choose a venue...</option>
							<option value="garden">Garden Venue - Elegant outdoors</option>
							<option value="beach">Beach Venue - Romantic seaside</option>
							<option value="ballroom">Ballroom - Grand and luxurious</option>
							<option value="hotel">Hotel Venue - Convenient all-in-one</option>
							<option value="barn">Barn Venue - Rustic charm</option>
						</select>
					</div>

					<div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
						<h2 className="text-2xl font-semibold mb-4 text-green-700">
							Catering
						</h2>
						<p className="text-gray-600 mb-6">
							Explore catering options and menu packages
						</p>
						<select
							className="w-full bg-green-50 border border-green-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-transparent"
							onChange={(e) => setSelectedCatering(e.target.value)}
							value={selectedCatering}>
							<option value="">Choose catering...</option>
							<option value="italian">Italian Cuisine - Pasta and pizza</option>
							<option value="indian">
								Indian Cuisine - Traditional flavors
							</option>
							<option value="seafood">
								Seafood Specialties - Fresh from the ocean
							</option>
							<option value="vegetarian">
								Vegetarian/Vegan - Plant-based delights
							</option>
							<option value="buffet">Buffet Style - Variety for all</option>
							<option value="plated">
								Plated Dinner - Gourmet presentation
							</option>
						</select>
					</div>

					<div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
						<h2 className="text-2xl font-semibold mb-4 text-purple-700">
							Decorations
						</h2>
						<p className="text-gray-600 mb-6">
							Choose from professional decoration services
						</p>
						<select
							className="w-full bg-purple-50 border border-purple-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
							onChange={(e) => setSelectedDecorations(e.target.value)}
							value={selectedDecorations}>
							<option value="">Choose decorations...</option>
							<option value="floral">
								Floral Arrangements - Blooming beauty
							</option>
							<option value="lightning">
								Lighting Setup - Magical ambiance
							</option>
							<option value="balloon">
								Balloon Arrivals - Fun and festive
							</option>
							<option value="drapery">
								Drapery and Linens - Elegant touch
							</option>
							<option value="stage">Stage Design - Custom focal point</option>
							<option value="themed">Themed Decor - Personalized theme</option>
						</select>
					</div>
				</div>

				<div className="text-center mt-12">
					<button
						onClick={calculateEstimate}
						className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
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
								onClick={() => navigate("/vendors", { state: { estimate, eventRoute: "/wedding" } })}
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

export default Wedding;
