import { motion } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { placeOrder } from "../../api/order.api";
import toast from "react-hot-toast";
import { useState } from "react";
import { createPortal } from "react-dom";

export default function OrderPanel({ reel, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    setLoading(true);
    try {
      await placeOrder({
        foodId: reel._id,
        amount: reel.price,
      });
      toast.success("Order placed successfully! 🍽️");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-brand" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Food Details */}
        <div className="flex gap-4 mb-6 border-b border-gray-100 pb-5">
          <video
            src={reel.video}
            className="w-20 h-20 rounded-xl object-cover bg-black"
            muted
            playsInline
          />
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-gray-900 leading-snug">{reel.name}</h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{reel.description}</p>
            <span className="text-brand font-extrabold text-sm mt-1">₹{reel.price}</span>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Item Total</span>
            <span>₹{reel.price}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Delivery Fees</span>
            <span className="text-green-600 font-medium">FREE</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
            <span className="font-bold text-gray-900">Grand Total</span>
            <span className="text-xl font-black text-brand">₹{reel.price}</span>
          </div>
        </div>

        {/* Order Button */}
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-brand/10 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Placing Order..." : "Confirm Order"}
        </button>
      </motion.div>
    </motion.div>,
    document.body
  );
}
