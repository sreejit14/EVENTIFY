function CartIcon({ itemCount, onOpen }) {
	if (itemCount === 0) return null;

	return (
		<div
			className="fixed bottom-4 right-4 bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg cursor-pointer hover:bg-green-700 transition-colors"
			onClick={onOpen}
			role="button"
			aria-label="Open cart"
			tabIndex={0}
		>
			Cart
			<span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
				{itemCount}
			</span>
		</div>
	);
}

export default CartIcon;
