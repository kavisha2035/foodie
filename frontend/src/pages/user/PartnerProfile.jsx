import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFoodPartnerById } from "../../api/food.api";
import Loader from "../../components/ui/Loader";
import { Store, MapPin, Phone, User, Eye, ArrowLeft } from "lucide-react";
import { useState } from "react";
import ReelCard from "../../components/feed/ReelCard";

export default function PartnerProfile() {
  const { id } = useParams();
  const [selectedReel, setSelectedReel] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["partnerProfile", id],
    queryFn: () => getFoodPartnerById(id),
    refetchOnWindowFocus: false,
  });

  const partner = data?.data?.foodPartner;
  const foodItems = partner?.foodItems ?? [];

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-500 font-bold text-lg">Partner profile not found.</p>
        <Link to="/" className="text-brand font-bold text-sm mt-3 hover:underline">
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-6 flex flex-col">
      {/* Sticky Header back navigation */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
        <Link to="/" className="p-1 rounded-full hover:bg-gray-100 text-gray-700 transition">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-extrabold text-gray-900 text-sm">Restaurant Info</span>
      </div>

      {/* Banner / Header Info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-brand border border-brand/10">
            <Store size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
              {partner.name}
            </h1>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold tracking-wide mt-1">
              <User size={12} className="text-brand" />
              <span>Contact: {partner.contactName}</span>
            </div>
          </div>
        </div>

        {/* Address and details */}
        <div className="space-y-2 mt-4 text-xs text-gray-500">
          <div className="flex gap-2">
            <MapPin size={14} className="text-brand flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{partner.address}</span>
          </div>
          <div className="flex gap-2">
            <Phone size={14} className="text-brand flex-shrink-0 mt-0.5" />
            <span>{partner.phone}</span>
          </div>
        </div>
      </div>

      {/* Video Reels Grid */}
      <div className="flex-1 p-4">
        <h2 className="font-extrabold text-gray-900 text-sm tracking-tight mb-4 uppercase">
          Food Reels ({foodItems.length})
        </h2>

        {foodItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No reels posted by this restaurant yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {foodItems.map((reel) => (
              <div
                key={reel._id}
                onClick={() => setSelectedReel(reel)}
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex flex-col group cursor-pointer active:scale-98 transition-all"
              >
                {/* Thumbnail Video */}
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
                  <span className="text-brand font-black text-xs block mt-1.5">₹{reel.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Overlay */}
      {selectedReel && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={() => setSelectedReel(null)}
              className="bg-black/40 backdrop-blur-md text-white font-bold text-xs py-2 px-4.5 rounded-full border border-white/10"
            >
              Back to profile
            </button>
          </div>
          <ReelCard reel={selectedReel} isActive={true} />
        </div>
      )}
    </div>
  );
}
