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
