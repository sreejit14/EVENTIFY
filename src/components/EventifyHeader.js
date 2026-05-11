import React from "react";
import { Link } from "react-router-dom";

function EventifyHeader() {
	return (
		<header className="w-full bg-[#40a8ed] min-h-[70px] flex items-center px-4 shadow-md">
			<Link to="/" className="inline-block">
				<img
					alt="Eventify logo"
					src="/assets/event_logo.png"
					className="h-[72px] w-auto max-w-[240px] object-contain rounded-lg border-spacing-1"
				/>
			</Link>
		</header>
	);
}

export default EventifyHeader;
