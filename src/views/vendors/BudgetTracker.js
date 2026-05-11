function BudgetTracker({ estimate, cartTotal }) {
	if (estimate <= 0) return null;

	const remainingBudget = estimate - cartTotal;
	const totalSaved = Math.max(0, remainingBudget);

	return (
		<div className="mb-8 bg-white rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
			<h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
				Event Budget Tracker
			</h2>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<span className="text-lg font-medium">Original Estimate:</span>
					<span className="text-lg font-bold text-blue-600">Rs {estimate.toLocaleString("en-IN")}</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-lg font-medium">Cart Total:</span>
					<span className="text-lg font-bold text-green-600">Rs {cartTotal.toLocaleString("en-IN")}</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-lg font-medium">Remaining Budget:</span>
					<span className={`text-lg font-bold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
						Rs {remainingBudget.toLocaleString("en-IN")}
					</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-lg font-medium">Total Saved from Estimate:</span>
					<span className="text-lg font-bold text-purple-600">
						Rs {totalSaved.toLocaleString("en-IN")}
					</span>
				</div>
			</div>
		</div>
	);
}

export default BudgetTracker;
