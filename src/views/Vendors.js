import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import EventifyHeader from "../components/EventifyHeader";
import BudgetTracker from "./vendors/BudgetTracker";
import CartIcon from "./vendors/CartIcon";
import CartSidebar from "./vendors/CartSidebar";
import ChatBox from "./vendors/ChatBox";
import CheckoutModal from "./vendors/CheckoutModal";
import VendorCard from "./vendors/VendorCard";
import { calculateCartTotal } from "./vendors/vendorUtils";

function Vendors() {
  const location = useLocation();
  const estimate = location.state?.estimate || 0;
  const [selectedVendor, setSelectedVendor]     = useState(null);
  const [showChat, setShowChat]                 = useState(false);
  const [cartItems, setCartItems]               = useState([]);
  const [showCart, setShowCart]                 = useState(false);
  const [showCheckout, setShowCheckout]         = useState(false);
  const [cateringVendors, setCateringVendors]   = useState([]);
  const [decorationVendors, setDecorationVendors] = useState([]);
  const [venueVendors, setVenueVendors]         = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      // ✅ Fixed: use axios (respects baseURL set in App.js → points to Render)
      // ✅ Fixed: use single /api/vendors route that actually exists on server
      const response = await axios.get('/api/vendors');
      const allVendors = response.data;

      // ✅ Fixed: filter by category on frontend instead of separate routes
      setCateringVendors(allVendors.filter(v => v.category === 'catering'));
      setDecorationVendors(allVendors.filter(v => v.category === 'decoration'));
      setVenueVendors(allVendors.filter(v => v.category === 'venue'));
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError("Failed to load vendors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContactVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowChat(true);
  };

  const handleAddToCart = (vendor) => {
    setCartItems((items) => {
      const alreadyAdded = items.some((item) => item._id === vendor._id);
      if (alreadyAdded) return items;
      return [...items, vendor];
    });
    setShowCart(true);
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleOpenCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setCartItems([]);
  };

  const cartTotal = calculateCartTotal(cartItems);

  // ✅ Added: loading and error states shown to user
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
      <p className="text-blue-900 text-xl font-semibold">Loading vendors...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
      <p className="text-red-600 text-xl font-semibold">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 text-gray-800">
      <EventifyHeader />
      <div className="max-w-7xl mx-auto py-10 px-5">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-blue-900">
          Recommended Vendors
        </h1>

        <BudgetTracker estimate={estimate} cartTotal={cartTotal} />

        <VendorSection
          title="Catering Vendors"
          titleClassName="text-green-700"
          vendors={cateringVendors}
          onContact={handleContactVendor}
          onAddToCart={handleAddToCart}
        />
        <VendorSection
          title="Decoration Vendors"
          titleClassName="text-purple-700"
          vendors={decorationVendors}
          onContact={handleContactVendor}
          onAddToCart={handleAddToCart}
        />
        <VendorSection
          title="Venue Vendors"
          titleClassName="text-indigo-700"
          vendors={venueVendors}
          onContact={handleContactVendor}
          onAddToCart={handleAddToCart}
        />
      </div>

      {showChat && (
        <ChatBox selectedVendor={selectedVendor} onClose={() => setShowChat(false)} />
      )}

      {showCart && (
        <CartSidebar
          cartItems={cartItems}
          cateringVendors={cateringVendors}
          decorationVendors={decorationVendors}
          venueVendors={venueVendors}
          onClose={() => setShowCart(false)}
          onCheckout={handleOpenCheckout}
          onRemove={handleRemoveFromCart}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          cartItems={cartItems}
          onClose={() => setShowCheckout(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <CartIcon itemCount={cartItems.length} onOpen={() => setShowCart(true)} />
    </div>
  );
}

function VendorSection({ title, titleClassName, vendors, onContact, onAddToCart }) {
  // ✅ Added: don't render section if no vendors in that category
  if (!vendors || vendors.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className={`text-3xl font-semibold mb-8 text-center ${titleClassName}`}>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vendors.map((vendor, index) => (
          <VendorCard
            key={`${vendor.name}-${index}`}
            vendor={vendor}
            onContact={onContact}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

export default Vendors;
