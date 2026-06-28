import { useRef, useState, useEffect } from "react";
import { Heart, Bookmark, Share2, ShoppingBag, Volume2, VolumeX, Store } from "lucide-react";
import { useIntersection } from "../../hooks/useIntersection";
import { logInteraction } from "../../api/feed.api";
import { toggleLike, toggleSave } from "../../api/food.api";
import { Link } from "react-router-dom";
import OrderPanel from "./OrderPanel";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ReelCard({ reel, isActive }) {
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(reel.isLiked || false);
  const [likeCount, setLikeCount] = useState(reel.likeCount || 0);
  const [saved, setSaved] = useState(reel.isSaved || false);
  const [savesCount, setSavesCount] = useState(reel.savesCount || 0);
  const [showOrder, setShowOrder] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [watchStart, setWatchStart] = useState(null);

  // Play/pause and track duration based on active index
  const intersectionRef = useIntersection(
    () => {
      if (isActive && videoRef.current) {
        videoRef.current.play().catch(() => {});
        setWatchStart(Date.now());
      }
    },
    () => {
      if (videoRef.current) {
        videoRef.current.pause();
        logWatchDuration();
      }
    }
  );

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setWatchStart(Date.now());
    } else if (videoRef.current) {
      videoRef.current.pause();
      logWatchDuration();
    }
  }, [isActive]);

  const logWatchDuration = () => {
    if (watchStart && videoRef.current) {
      const duration = videoRef.current.duration * 1000;
      if (!duration || duration <= 0) return;
      const watched = Date.now() - watchStart;
      const pct = Math.min((watched / duration) * 100, 100);
      logInteraction(reel._id, { action: "watch", watchPercentage: Math.round(pct) }).catch(() => {});
      setWatchStart(null);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      await toggleLike(reel._id);
      await logInteraction(reel._id, { action: "like", watchPercentage: 0 });
    } catch {
      toast.error("Failed to update like status");
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      setSaved(!saved);
      setSavesCount(saved ? savesCount - 1 : savesCount + 1);
      await toggleSave(reel._id);
      await logInteraction(reel._id, { action: "save", watchPercentage: 0 });
      toast.success(saved ? "Removed from saved" : "Saved successfully! 📌");
    } catch {
      toast.error("Failed to update save status");
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await logInteraction(reel._id, { action: "share", watchPercentage: 0 });
      if (navigator.share) {
        await navigator.share({
          title: reel.name,
          text: reel.description,
          url: window.location.origin + `/food/${reel._id}`
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + `/food/${reel._id}`);
        toast.success("Link copied to clipboard! 🔗");
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error("Failed to share");
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      ref={intersectionRef}
      className="relative w-full h-[100dvh] snap-start flex-shrink-0 bg-black flex flex-col justify-between overflow-hidden"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={reel.video}
        className="absolute inset-0 w-full h-full object-cover z-0"
        loop
        muted={isMuted}
        playsInline
        webkit-playsinline="true"
        onClick={() => {
          if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
          }
        }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80 pointer-events-none z-10" />

      {/* Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <Link
          to={`/partner/${reel.foodPartner?._id || reel.foodPartner}`}
          className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-auto border border-white/10"
        >
          <Store size={14} className="text-brand" />
          <span className="text-xs font-bold text-white max-w-[120px] truncate">
            {reel.foodPartnerInfo?.name || reel.foodPartner?.name || "Merchant"}
          </span>
        </Link>
        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white pointer-events-auto border border-white/10"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Right Side Control Bar */}
      <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-6">
        {/* Like Button */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-all">
            <Heart
              size={24}
              className={liked ? "fill-brand text-brand scale-110" : "text-white group-hover:scale-105"}
            />
          </div>
          <span className="text-xxs text-white font-bold tracking-wider">{likeCount}</span>
        </button>

        {/* Save Button */}
        <button onClick={handleSave} className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-all">
            <Bookmark
              size={24}
              className={saved ? "fill-brand text-brand scale-110" : "text-white group-hover:scale-105"}
            />
          </div>
          <span className="text-xxs text-white font-bold tracking-wider">{savesCount}</span>
        </button>

        {/* Share Button */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-all">
            <Share2 size={24} className="text-white group-hover:scale-105" />
          </div>
          <span className="text-xxs text-white font-bold tracking-wider">Share</span>
        </button>
      </div>

      {/* Bottom Information Panel */}
      <div className="absolute bottom-24 left-4 right-20 z-20 pointer-events-none">
        <h2 className="text-white text-base font-extrabold tracking-wide leading-tight drop-shadow-md">
          {reel.name}
        </h2>
        {reel.description && (
          <p className="text-white/80 text-xs mt-1 leading-relaxed line-clamp-2 max-w-[280px] drop-shadow">
            {reel.description}
          </p>
        )}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {reel.moodTags?.map((tag) => (
            <span key={tag} className="bg-black/30 backdrop-blur-sm text-[9px] font-bold text-white px-2 py-0.5 rounded-full border border-white/5 capitalize">
              {tag.replace("_", " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Order Trigger Button */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        {reel.isAvailable !== false ? (
          <button
            onClick={() => setShowOrder(true)}
            className="w-full bg-brand hover:bg-brand-dark text-white font-black py-4.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition duration-200 active:scale-95 text-sm"
          >
            <ShoppingBag size={18} />
            ORDER NOW — ₹{reel.price}
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-gray-500/50 backdrop-blur-md text-white/85 font-black py-4.5 rounded-2xl cursor-not-allowed text-sm"
          >
            TEMPORARILY UNAVAILABLE
          </button>
        )}
      </div>

      {/* Checkout Sheet */}
      <AnimatePresence>
        {showOrder && (
          <OrderPanel
            reel={reel}
            onClose={() => setShowOrder(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
