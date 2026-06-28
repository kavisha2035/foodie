import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFoodPartnerOrders, updateOrderStatus } from "../../api/order.api";
import { logoutPartner } from "../../api/auth.api";
import { getFoodItems, updateFood, deleteFood } from "../../api/food.api";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Upload, ShoppingBag, Store, User, ToggleLeft, ToggleRight, Trash2, ShieldAlert } from "lucide-react";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";
import { useState } from "react";

export default function PartnerDashboard() {
  const { partner, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("orders"); // orders | my_reels

  // Fetch partner's orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["partnerOrders"],
    queryFn: () => getFoodPartnerOrders(),
    refetchOnWindowFocus: false,
  });

  // Fetch all food items (client profile query is reused or we filter for owned items)
  const { data: foodData, isLoading: foodLoading } = useQuery({
    queryKey: ["allFoodItems"],
    queryFn: getFoodItems,
    refetchOnWindowFocus: false,
  });

  const orders = ordersData?.data?.orders ?? [];
  const allReels = foodData?.data?.foodItems ?? [];
  // Filter for reels uploaded by this partner
  const myReels = allReels.filter(r => r.foodPartner === partner._id || r.foodPartner?._id === partner._id);

  // Status transitions mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["partnerOrders"]);
      toast.success("Order status updated! 🚀");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update order status");
    }
  });

  // Toggle availability mutation
  const toggleAvailableMutation = useMutation({
    mutationFn: ({ id, isAvailable }) => updateFood(id, { isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries(["allFoodItems"]);
      toast.success("Availability updated");
    }
  });

  // Delete food item mutation
  const deleteFoodMutation = useMutation({
    mutationFn: (id) => deleteFood(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["allFoodItems"]);
      toast.success("Food reel deleted successfully");
    }
  });

  const handleLogout = async () => {
    try {
      await logoutPartner();
      clearAuth();
      toast.success("Logged out successfully");
      navigate("/partner/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header info */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand">
            <Store size={20} />
          </div>
          <div>
            <h1 className="font-black text-gray-900 text-base leading-none tracking-tight">{partner.name}</h1>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 block">
              Partner Console
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-gray-400 hover:text-brand hover:bg-brand-light transition"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 flex z-10 px-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-4.5 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2
            ${activeTab === "orders" ? "border-brand text-brand" : "border-transparent text-gray-400"}`}
        >
          Incoming Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("my_reels")}
          className={`flex-1 py-4.5 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2
            ${activeTab === "my_reels" ? "border-brand text-brand" : "border-transparent text-gray-400"}`}
        >
          My Food Reels ({myReels.length})
        </button>
      </div>

      {/* Main dashboard content */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar pb-24">
        {activeTab === "orders" ? (
          ordersLoading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <div className="h-[250px] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-gray-100 mt-4">
              <ShoppingBag size={32} className="text-gray-300 mb-2" />
              <p className="text-gray-500 font-bold">No incoming orders yet</p>
              <p className="text-gray-400 text-xxs mt-1">
                Your menu is online. When users order from your reels, they will display here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3"
                >
                  {/* Order header */}
                  <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Order: {order._id.substring(order._id.length - 8)}
                    </span>
                    <span className="text-brand font-black text-xs">₹{order.amount}</span>
                  </div>

                  {/* Order detail card info */}
                  <div className="flex gap-3">
                    <video src={order.foodId?.video} className="w-12 h-12 rounded-lg object-cover bg-black" muted />
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-gray-900 text-xs leading-none">{order.foodId?.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <User size={10} className="text-brand" />
                        <span>Client: {order.userId?.fullName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions depending on status */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="text-xxs font-bold uppercase text-gray-400">
                      Status: <strong className="text-brand uppercase">{order.status}</strong>
                    </span>

                    <div className="flex gap-2">
                      {order.status === "placed" && (
                        <>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: order._id, status: "cancelled" })}
                            className="text-[10px] font-bold text-red-500 px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: order._id, status: "confirmed" })}
                            className="text-[10px] font-bold text-white px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-dark transition"
                          >
                            Accept
                          </button>
                        </>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: order._id, status: "preparing" })}
                          className="text-[10px] font-bold text-white px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-dark transition"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: order._id, status: "delivered" })}
                          className="text-[10px] font-bold text-white px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-dark transition"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          foodLoading ? (
            <Loader />
          ) : myReels.length === 0 ? (
            <div className="h-[250px] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-gray-100 mt-4">
              <Upload size={32} className="text-gray-300 mb-2" />
              <p className="text-gray-500 font-bold">No food reels posted yet</p>
              <Link
                to="/partner/upload"
                className="text-brand font-bold text-xxs mt-2 hover:underline tracking-wider uppercase"
              >
                Upload First Reel
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myReels.map((reel) => (
                <div
                  key={reel._id}
                  className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex items-center gap-3.5"
                >
                  <video src={reel.video} className="w-16 h-16 rounded-xl object-cover bg-black" muted />
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 text-xs leading-snug">{reel.name}</h3>
                    <span className="text-brand font-black text-xs mt-1 block">₹{reel.price}</span>
                  </div>

                  {/* Toggle availability & delete */}
                  <div className="flex flex-col gap-3 items-end">
                    <button
                      onClick={() => toggleAvailableMutation.mutate({
                        id: reel._id,
                        isAvailable: !reel.isAvailable
                      })}
                      className="text-gray-400 hover:text-brand"
                    >
                      {reel.isAvailable ? (
                        <div className="flex items-center gap-1 text-green-600 font-extrabold text-[10px]">
                          <span>Active</span>
                          <ToggleRight size={22} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400 font-bold text-[10px]">
                          <span>Paused</span>
                          <ToggleLeft size={22} />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this food reel?")) {
                          deleteFoodMutation.mutate(reel._id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Floating Action Button for uploads */}
      <Link
        to="/partner/upload"
        className="fixed bottom-6 right-6 bg-brand hover:bg-brand-dark text-white p-4.5 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all z-20"
      >
        <Upload size={22} />
      </Link>
    </div>
  );
}
