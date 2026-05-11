import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventifyHeader from "../components/EventifyHeader";

function Bookings({ user }) {
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [reviewForms, setReviewForms] = useState({});
	const [submittingReviewId, setSubmittingReviewId] = useState("");

	useEffect(() => {
		fetchBookings();
	}, []);

	const fetchBookings = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("http://localhost:5000/api/bookings", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				setBookings(await response.json());
			}
		} catch (error) {
			console.error("Error fetching bookings:", error);
			setMessage("Unable to load bookings right now.");
		} finally {
			setLoading(false);
		}
	};

	const handleCancelBooking = async (bookingId) => {
		if (!window.confirm("Are you sure you want to cancel this booking?")) return;

		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				setMessage("Booking cancelled.");
				fetchBookings();
			}
		} catch (error) {
			console.error("Error canceling booking:", error);
			setMessage("Unable to cancel this booking.");
		}
	};

	const updateReviewForm = (bookingId, field, value) => {
		setReviewForms((forms) => ({
			...forms,
			[bookingId]: {
				rating: "5",
				comment: "",
				...forms[bookingId],
				[field]: value,
			},
		}));
	};

	const handleSubmitReview = async (booking) => {
		const form = reviewForms[booking.id] || { rating: "5", comment: "" };

		if (!form.comment.trim()) {
			setMessage("Please add a comment before submitting your review.");
			return;
		}

		try {
			setSubmittingReviewId(booking.id);
			const token = localStorage.getItem("token");
			const response = await fetch(`http://localhost:5000/api/bookings/${booking.id}/reviews`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					rating: Number(form.rating),
					comment: form.comment,
				}),
			});

			if (response.ok) {
				setMessage("Review submitted. Vendor ratings have been updated.");
				setReviewForms((forms) => ({
					...forms,
					[booking.id]: { rating: "5", comment: "" },
				}));
				fetchBookings();
			} else {
				const error = await response.json().catch(() => ({}));
				setMessage(error.message || "Unable to submit review.");
			}
		} catch (error) {
			console.error("Error submitting review:", error);
			setMessage("Unable to submit review.");
		} finally {
			setSubmittingReviewId("");
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 text-gray-800">
			<EventifyHeader />
			<main className="max-w-6xl mx-auto px-4 py-8">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
					<div>
						<p className="text-sm font-medium text-blue-700">Welcome, {user?.name}</p>
						<h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
					</div>
					<Link to="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
						Back to homepage
					</Link>
				</div>

				{message && (
					<div className="mb-6 rounded-md bg-white border border-blue-100 px-4 py-3 text-sm text-blue-800 shadow-sm">
						{message}
					</div>
				)}

				{loading ? (
					<div className="rounded-lg bg-white p-8 text-center shadow-sm">Loading bookings...</div>
				) : bookings.length === 0 ? (
					<div className="rounded-lg bg-white p-8 text-center shadow-sm">
						<p className="text-gray-600 mb-4">You do not have any bookings yet.</p>
						<Link to="/vendors" className="font-semibold text-blue-700 hover:text-blue-900">
							Browse vendors
						</Link>
					</div>
				) : (
					<div className="space-y-6">
						{bookings.map((booking) => (
							<BookingCard
								key={booking.id}
								booking={booking}
								form={reviewForms[booking.id] || { rating: "5", comment: "" }}
								isSubmitting={submittingReviewId === booking.id}
								onCancel={handleCancelBooking}
								onChange={updateReviewForm}
								onSubmit={handleSubmitReview}
							/>
						))}
					</div>
				)}
			</main>
		</div>
	);
}

function BookingCard({ booking, form, isSubmitting, onCancel, onChange, onSubmit }) {
	const vendor = booking.vendor;

	return (
		<section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
			<div className="p-5">
				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">{booking.vendorName}</h2>
						<p className="text-sm text-gray-600 mt-1">{vendor?.description}</p>
					</div>
					<button
						onClick={() => onCancel(booking.id)}
						className="self-start bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm font-semibold transition-colors"
					>
						Cancel Booking
					</button>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5 text-sm">
					<Info label="Category" value={booking.vendorCategory} />
					<Info label="Price" value={booking.price} />
					<Info label="Rating" value={`${vendor?.rating || "N/A"}/5`} />
					<Info label="Booked On" value={new Date(booking.createdAt).toLocaleDateString()} />
				</div>

					{vendor?.contact && <p className="text-sm text-gray-600 mb-4">Contact: {vendor.contact}</p>}

					{Array.isArray(vendor?.services) && vendor.services.length > 0 && (
						<div className="mb-5">
							<h3 className="font-semibold text-gray-900 mb-2">Vendor Services</h3>
							<div className="flex flex-wrap gap-2">
								{vendor.services.map((service) => (
									<span key={service} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-900">
										{service}
									</span>
								))}
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
						<div>
							<h3 className="font-semibold text-gray-900 mb-2">Recent Reviews</h3>
							<div className="space-y-2 max-h-44 overflow-y-auto pr-1">
								{(vendor?.reviews || []).map((review, index) => (
									<div key={`${review.name}-${index}`} className="rounded-md bg-gray-50 p-3 text-sm">
										<p className="font-medium text-gray-800">
											{review.name} - {review.rating}/5
										</p>
										<p className="text-gray-600">{review.comment}</p>
									</div>
								))}
							</div>
						</div>

						<form
							onSubmit={(event) => {
								event.preventDefault();
								onSubmit(booking);
							}}
							className="rounded-md border border-gray-200 p-4"
						>
							<h3 className="font-semibold text-gray-900 mb-3">Add Your Rating</h3>
							<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`rating-${booking.id}`}>
								Rating
							</label>
							<select
								id={`rating-${booking.id}`}
								value={form.rating}
								onChange={(event) => onChange(booking.id, "rating", event.target.value)}
								className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="5">5 - Excellent</option>
								<option value="4">4 - Good</option>
								<option value="3">3 - Average</option>
								<option value="2">2 - Poor</option>
								<option value="1">1 - Bad</option>
							</select>

							<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`comment-${booking.id}`}>
								Comment
							</label>
							<textarea
								id={`comment-${booking.id}`}
								value={form.comment}
								onChange={(event) => onChange(booking.id, "comment", event.target.value)}
								rows="4"
								className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Share your experience with this vendor"
							/>
							<button
								type="submit"
								disabled={isSubmitting}
								className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${
									!isSubmitting
										? "bg-blue-600 hover:bg-blue-700 text-white"
										: "bg-gray-300 text-gray-500 cursor-not-allowed"
								}`}
							>
								{isSubmitting ? "Submitting..." : "Submit Review"}
							</button>
						</form>
					</div>
				</div>
		</section>
	);
}

function Info({ label, value }) {
	return (
		<div className="rounded-md bg-gray-50 p-3">
			<p className="text-xs uppercase text-gray-500">{label}</p>
			<p className="font-semibold text-gray-900">{value}</p>
		</div>
	);
}

export default Bookings;
