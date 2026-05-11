function ChatBox({ selectedVendor, onClose }) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold">Chat with {selectedVendor?.name}</h3>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">
						X
					</button>
				</div>
				<div className="h-64 bg-gray-100 rounded p-4 mb-4 overflow-y-auto">
					<p className="text-gray-600">
						Welcome to our chat! How can we help you with your event planning?
					</p>
				</div>
				<div className="flex">
					<input
						type="text"
						placeholder="Type your message..."
						className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r">
						Send
					</button>
				</div>
			</div>
		</div>
	);
}

export default ChatBox;
