import { getVendorReviews, getVendorServices } from "./vendorUtils";

function VendorCard({ vendor, onContact, onAddToCart }) {
	return (
		<div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
			{vendor.image && <img src={vendor.image} alt={vendor.name} className="w-full h-48 object-cover rounded-xl mb-4" />}
			<h3 className="text-xl font-semibold mb-2 text-gray-800">{vendor.name}</h3>
			<p className="text-gray-600 mb-4">{vendor.description}</p>
			<div className="space-y-2">
				<p className="text-sm text-gray-500">
					<span className="font-medium">Contact:</span> {vendor.contact}
				</p>
				<p className="text-sm text-gray-500">
					<span className="font-medium">Rating:</span> {vendor.rating}/5
				</p>
				<p className="text-sm text-gray-500">
					<span className="font-medium">Price Range:</span> {vendor.priceRange}
				</p>
			</div>
			<div className="mt-4">
				<h4 className="font-semibold text-sm text-gray-800 mb-2">Services</h4>
				<ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4">
					{getVendorServices(vendor).map((service, index) => (
						<li key={index}>{service}</li>
					))}
				</ul>
				<h4 className="font-semibold text-sm text-gray-800 mb-2">User Reviews</h4>
				<div className="space-y-2">
					{getVendorReviews(vendor).map((review, index) => (
						<div key={index} className="bg-gray-50 rounded-md p-2">
							<p className="text-xs font-medium text-gray-700">
								{review.name} - {review.rating}/5
							</p>
							<p className="text-xs text-gray-600">{review.comment}</p>
						</div>
					))}
				</div>
			</div>
			<div className="mt-4 flex space-x-2">
				<button
					onClick={() => onContact(vendor)}
					className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300"
				>
					Contact Vendor
				</button>
				<button
					onClick={() => onAddToCart(vendor)}
					className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300"
				>
					Add to Cart
				</button>
			</div>
		</div>
	);
}

export default VendorCard;
