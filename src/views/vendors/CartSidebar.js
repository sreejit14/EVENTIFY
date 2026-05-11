function CartSection({ title, titleClassName, items, cartItems, onRemove }) {
	if (items.length === 0) return null;

	return (
		<div className="mb-6">
			<h3 className={`text-lg font-semibold mb-3 ${titleClassName}`}>{title}</h3>
			<div className="space-y-3">
				{items.map((item, index) => (
					<div key={`${item.name}-${index}`} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
						<div>
							<h4 className="font-medium text-gray-800">{item.name}</h4>
							<p className="text-sm text-gray-600">{item.priceRange}</p>
						</div>
						<button
							onClick={() => onRemove(cartItems.indexOf(item))}
							className="text-red-500 hover:text-red-700"
							aria-label={`Remove ${item.name}`}
						>
							Remove
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

function CartSidebar({
	cartItems,
	cateringVendors,
	decorationVendors,
	venueVendors,
	onClose,
	onCheckout,
	onRemove,
}) {
	const cateringItems = cartItems.filter(item => cateringVendors.some(v => v.name === item.name));
	const decorationItems = cartItems.filter(item => decorationVendors.some(v => v.name === item.name));
	const venueItems = cartItems.filter(item => venueVendors.some(v => v.name === item.name));

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
			<div className="bg-white w-full max-w-md h-full overflow-y-auto">
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
						<button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
							X
						</button>
					</div>

					<CartSection
						title="Catering Services"
						titleClassName="text-green-700"
						items={cateringItems}
						cartItems={cartItems}
						onRemove={onRemove}
					/>
					<CartSection
						title="Decoration Services"
						titleClassName="text-purple-700"
						items={decorationItems}
						cartItems={cartItems}
						onRemove={onRemove}
					/>
					<CartSection
						title="Venue Services"
						titleClassName="text-indigo-700"
						items={venueItems}
						cartItems={cartItems}
						onRemove={onRemove}
					/>

					{cartItems.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-500">Your cart is empty</p>
						</div>
					)}

					{cartItems.length > 0 && (
						<div className="mt-8">
							<button
								onClick={onCheckout}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
							>
								Proceed to Checkout
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default CartSidebar;
