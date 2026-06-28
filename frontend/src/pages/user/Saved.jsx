import { useQuery } from "@tanstack/react-query";
import { getSavedFoods } from "../../api/food.api";
import BottomNav from "../../components/layout/BottomNav";
import Loader from "../../components/ui/Loader";
import { Bookmark, Eye, ShoppingBag } from "lucide-react";
import { useState } from "react";
import ReelCard from "../../components/feed/ReelCard";

export default function Saved() {
  const { data, isLoading } = useQuery({
    queryKey: ["savedFoods"],
    queryFn: getSavedFoods,
    refetchOnWindowFocus: false,
  });

  const savedList = data?.data?.savedFoods ?? [];
  const [selectedReel, setSelectedReel] = useState(null);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col bg-white overflow-hidden pb-16 border-x border-gray-100 shadow-xl relative">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center gap-2">
        <Bookmark className="text-brand" size={22} />
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Saved Reels</h1>
      </header>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {savedList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-3 border border-gray-100">
              <Bookmark size={24} />
            </div>
            <p className="text-gray-500 font-bold">No saved reels yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Tap the bookmark icon on reels to save them here for quick checkout.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {savedList.map((item) => {
              const reel = item.food;
              if (!reel) return null;
              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedReel(reel)}
                  className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex flex-col group cursor-pointer active:scale-98 transition-all"
                >
                  {/* Thumbnail Video Placeholder */}
                  <div className="aspect-[3/4] relative bg-black flex items-center justify-center overflow-hidden">
                    <video
                      src={reel.video}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white">
                        <Eye size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-xs leading-snug truncate">
                      {reel.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      by {reel.foodPartner?.name || "Partner"}
                    </p>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-100">
                      <span className="text-brand font-black text-xs">₹{reel.price}</span>
                      <ShoppingBag size={12} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-Screen Video Detail overlay */}
      {selectedReel && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={() => setSelectedReel(null)}
              className="bg-black/40 backdrop-blur-md text-white font-bold text-xs py-2 px-4.5 rounded-full border border-white/10"
            >
              Back to grid
            </button>
          </div>
          <ReelCard reel={selectedReel} isActive={true} />
        </div>
      )}

      <BottomNav />
    </div>
  );
}
