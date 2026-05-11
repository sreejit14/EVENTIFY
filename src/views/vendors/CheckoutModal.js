import { useState } from "react";
import { calculateCartTotal, getVendorEstimatedPrice } from "./vendorUtils";

function CheckoutModal({ cartItems, onClose, onPaymentSuccess }) {
	const [selectedPayment, setSelectedPayment] = useState("");
	const totalAmount = calculateCartTotal(cartItems);

	const handlePayment = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("http://localhost:5000/api/bookings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					items: cartItems,
					totalAmount,
					paymentMethod: selectedPayment,
				}),
			});

			if (response.ok) {
				alert(`Payment of Rs ${totalAmount.toLocaleString("en-IN")} processed successfully via ${selectedPayment}! Booking confirmed.`);
				onPaymentSuccess();
			} else {
				alert("Booking failed. Please login again.");
			}
		} catch (error) {
			console.error("Booking error:", error);
			alert("Booking failed.");
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-800">Invoice & Payment</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
						X
					</button>
				</div>

				<div className="bg-gray-50 p-4 rounded-lg mb-6">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-semibold">Event Planner Invoice</h3>
						<p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
					</div>
					<div className="border-t pt-4">
						<h4 className="font-medium mb-3">Services Selected:</h4>
						<div className="space-y-2">
							{cartItems.map((item, index) => (
								<div key={`${item.name}-${index}`} className="flex justify-between text-sm">
									<span>{item.name}</span>
									<span>Rs {getVendorEstimatedPrice(item.priceRange).toLocaleString("en-IN")}</span>
								</div>
							))}
						</div>
						<div className="border-t mt-4 pt-2 flex justify-between font-semibold">
							<span>Total Amount:</span>
							<span>Rs {totalAmount.toLocaleString("en-IN")}</span>
						</div>
					</div>
				</div>

				<div className="mb-6">
					<h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<PaymentOption
							id="card"
							label="Credit/Debit Card"
							description="Visa, Mastercard, RuPay"
							colorClassName="blue"
							selectedPayment={selectedPayment}
							onSelect={setSelectedPayment}
						/>
						<PaymentOption
							id="upi"
							label="UPI"
							description="Google Pay, PhonePe, Paytm"
							colorClassName="green"
							selectedPayment={selectedPayment}
							onSelect={setSelectedPayment}
						/>
						<PaymentOption
							id="netbanking"
							label="Net Banking"
							description="All major banks"
							colorClassName="purple"
							selectedPayment={selectedPayment}
							onSelect={setSelectedPayment}
						/>
						<PaymentOption
							id="wallet"
							label="Digital Wallet"
							description="Paytm, Mobikwik, Ola Money"
							colorClassName="orange"
							selectedPayment={selectedPayment}
							onSelect={setSelectedPayment}
						/>
					</div>
				</div>

				<PaymentDetails selectedPayment={selectedPayment} />

				<div className="flex space-x-4">
					<button
						onClick={onClose}
						className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handlePayment}
						disabled={!selectedPayment}
						className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
							selectedPayment
								? "bg-green-600 hover:bg-green-700 text-white"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
						}`}
					>
						Pay Rs {totalAmount.toLocaleString("en-IN")}
					</button>
				</div>
			</div>
		</div>
	);
}

function PaymentOption({ id, label, description, colorClassName, selectedPayment, onSelect }) {
	const colorStyles = {
		blue: selectedPayment === id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300",
		green: selectedPayment === id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300",
		purple: selectedPayment === id ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300",
		orange: selectedPayment === id ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300",
	};

	return (
		<div
			className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${colorStyles[colorClassName]}`}
			onClick={() => onSelect(id)}
		>
			<div className="flex items-center">
				<div>
					<h4 className="font-medium">{label}</h4>
					<p className="text-sm text-gray-600">{description}</p>
				</div>
			</div>
		</div>
	);
}

function PaymentDetails({ selectedPayment }) {
	if (!selectedPayment) return null;

	return (
		<div className="mb-6">
			<h4 className="font-medium mb-3">Payment Details</h4>
			{selectedPayment === "card" && (
				<div className="space-y-3">
					<input type="text" placeholder="Card Number" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
					<div className="grid grid-cols-2 gap-3">
						<input type="text" placeholder="MM/YY" className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
						<input type="text" placeholder="CVV" className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
					</div>
					<input type="text" placeholder="Cardholder Name" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
				</div>
			)}
			{selectedPayment === "upi" && (
				<div className="space-y-3">
					<input type="text" placeholder="Enter UPI ID (e.g., user@paytm)" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
					<p className="text-sm text-gray-600">Or scan QR code with your UPI app</p>
				</div>
			)}
			{selectedPayment === "netbanking" && (
				<select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
					<option>Select Bank</option>
					<option>SBI</option>
					<option>HDFC</option>
					<option>ICICI</option>
					<option>Axis Bank</option>
					<option>Other Banks</option>
				</select>
			)}
			{selectedPayment === "wallet" && (
				<select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
					<option>Select Wallet</option>
					<option>Paytm</option>
					<option>Mobikwik</option>
					<option>Ola Money</option>
					<option>Amazon Pay</option>
				</select>
			)}
		</div>
	);
}

export default CheckoutModal;
