import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import { Link } from "react-router-dom";
import axios from "axios";
import EventifyHeader from "../components/EventifyHeader";

function Bookings({ user }) {
  const [bookings, setBookings]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [message, setMessage]                 = useState("");
  const [reviewForms, setReviewForms]         = useState({});
  const [submittingReviewId, setSubmittingReviewId] = useState("");

  // ✅ Fixed: Wrap fetchBookings in useCallback to satisfy ESLint
  const fetchBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      // Ensure we have a user ID before making the call
      if (!user?.id) return;

      const response = await axios.get(`/api/bookings/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setMessage("Unable to load bookings right now.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Only recreate if user ID changes

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]); // Now fetchBookings is a safe dependency
  
  // ... rest of your handleCancelBooking and other functions
   const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("token");
      // ✅ Fixed: use axios, correct URL
      await axios.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Booking cancelled successfully.");
      fetchBookings();
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
    // ✅ Fixed: use booking._id (MongoDB) not booking.id
    const bookingId = booking._id;
    const form = reviewForms[bookingId] || { rating: "5", comment: "" };

    if (!form.comment.trim()) {
      setMessage("Please add a comment before submitting your review.");
      return;
    }

    try {
      setSubmittingReviewId(bookingId);
      const token = localStorage.getItem("token");
      // ✅ Fixed: use axios, correct URL with _id
      await axios.post(`/api/reviews`, {
        vendorId: booking.vendorId,
        rating:   Number(form.rating),
        comment:  form.comment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("Review submitted successfully. Vendor ratings have been updated.");
      setReviewForms((forms) => ({
        ...forms,
        [bookingId]: { rating: "5", comment: "" },
      }));
      fetchBookings();
    } catch (error) {
      console.error("Error submitting review:", error);
      const msg = error.response?.data?.message || "Unable to submit review.";
      setMessage(msg);
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
                key={booking._id}  // ✅ Fixed: use _id not id
                booking={booking}
                form={reviewForms[booking._id] || { rating: "5", comment: "" }}
                isSubmitting={submittingReviewId === booking._id}
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
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{booking.vendorName}</h2>
            <p className="text-sm text-gray-500 mt-1 capitalize">{booking.vendorCategory}</p>
          </div>
          <button
            onClick={() => onCancel(booking._id)}  // ✅ Fixed: _id not id
            className="self-start bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm font-semibold transition-colors"
          >
            Cancel Booking
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-5 text-sm">
          <Info label="Category" value={booking.vendorCategory} />
          <Info label="Price"    value={`₹${Number(booking.price).toLocaleString("en-IN")}`} />
          <Info label="Booked On" value={new Date(booking.createdAt).toLocaleDateString()} />
        </div>

        {/* Review Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(booking); }}
          className="rounded-md border border-gray-200 p-4 mt-4"
        >
          <h3 className="font-semibold text-gray-900 mb-3">Add Your Review</h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <select
            value={form.rating}
            onChange={(e) => onChange(booking._id, "rating", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Bad</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
          <textarea
            value={form.comment}
            onChange={(e) => onChange(booking._id, "comment", e.target.value)}
            rows="3"
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

