import { useQuery } from "@tanstack/react-query";
import { getUserOrders } from "../../api/order.api";
import BottomNav from "../../components/layout/BottomNav";
import Loader from "../../components/ui/Loader";
import { ShoppingBag, Calendar, CheckCircle2, Clock, Truck, ShieldAlert } from "lucide-react";

const statusIcons = {
  placed: { icon: Clock, color: "text-amber-500 bg-amber-50 border-amber-100" },
  confirmed: { icon: CheckCircle2, color: "text-blue-500 bg-blue-50 border-blue-100" },
  preparing: { icon: Clock, color: "text-indigo-500 bg-indigo-50 border-indigo-100" },
  delivered: { icon: Truck, color: "text-green-500 bg-green-50 border-green-100" },
  cancelled: { icon: ShieldAlert, color: "text-red-500 bg-red-50 border-red-100" },
};

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ["userOrders"],
    queryFn: getUserOrders,
    refetchOnWindowFocus: false,
  });

  const orders = data?.data?.orders ?? [];

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden pb-16">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center gap-2">
        <ShoppingBag className="text-brand" size={22} />
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Your Orders</h1>
      </header>

      {/* Orders list */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-4">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-3 border border-gray-100">
              <ShoppingBag size={24} />
            </div>
            <p className="text-gray-500 font-bold">No orders found</p>
            <p className="text-gray-400 text-xs mt-1">
              Check out some reels and place your first order directly from videos!
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const statusConfig = statusIcons[order.status] || statusIcons.placed;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3"
              >
                {/* Header (Status & Date) */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xxs font-bold uppercase tracking-wider">
                    <Calendar size={12} />
                    <span>{new Date(order.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}</span>
                  </div>
                  <div className={`flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-xxs font-extrabold capitalize tracking-wide ${statusConfig.color}`}>
                    <StatusIcon size={10} />
                    <span>{order.status}</span>
                  </div>
                </div>

                {/* Body (Item info) */}
                <div className="flex gap-3">
                  <video
                    src={order.foodId?.video}
                    className="w-14 h-14 rounded-xl object-cover bg-black"
                    muted
                    playsInline
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 text-xs leading-snug">{order.foodId?.name || "Deleted Food Item"}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Prepared by: {order.foodPartnerId?.name || "Merchant"}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center text-right">
                    <span className="text-brand font-black text-xs">₹{order.amount}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
