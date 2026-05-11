export const parsePriceToNumber = (priceText) => {
	const cleaned = String(priceText || "").replace(/[^0-9]/g, "");
	return cleaned ? parseInt(cleaned, 10) : 0;
};

export const getVendorEstimatedPrice = (priceRange) => {
	const [minRaw, maxRaw] = String(priceRange || "").split("-");
	const min = parsePriceToNumber(minRaw);
	const max = parsePriceToNumber(maxRaw);
	if (min && max) return Math.round((min + max) / 2);
	return min || max || 0;
};

export const calculateCartTotal = (cartItems) =>
	cartItems.reduce((sum, item) => sum + getVendorEstimatedPrice(item.priceRange), 0);

export const getVendorServices = (vendor) => {
	if (Array.isArray(vendor.services) && vendor.services.length > 0) return vendor.services;

	const servicesByCategory = {
		catering: ["Menu planning", "Live counters", "Serving staff", "Hygiene setup"],
		decoration: ["Theme setup", "Floral styling", "Lighting design", "Stage decor"],
		venue: ["Event space", "Parking support", "Power backup", "Guest seating"],
	};

	return servicesByCategory[vendor.category] || ["Custom planning support", "On-site coordination"];
};

export const getVendorReviews = (vendor) => {
	if (Array.isArray(vendor.reviews) && vendor.reviews.length > 0) return vendor.reviews;

	const reviewsByCategory = {
		catering: [
			{ name: "Ananya S.", rating: 5, comment: "Food quality was excellent and service was quick." },
			{ name: "Rahul M.", rating: 4, comment: "Great menu options and good value for money." },
		],
		decoration: [
			{ name: "Priya K.", rating: 5, comment: "Beautiful setup exactly as promised." },
			{ name: "Nitin R.", rating: 4, comment: "Creative concepts and smooth execution." },
		],
		venue: [
			{ name: "Megha T.", rating: 5, comment: "Spacious venue with great management support." },
			{ name: "Arjun P.", rating: 4, comment: "Good location and well-maintained facilities." },
		],
	};

	return reviewsByCategory[vendor.category] || [
		{ name: "Customer", rating: 4, comment: "Professional vendor with reliable support." },
	];
};
