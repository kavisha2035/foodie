import { useState } from "react";
import StoryBar from "../../components/stories/StoryBar";
import { useQuery } from "@tanstack/react-query";
import { getFeed } from "../../api/feed.api";
import ReelCard from "../../components/feed/ReelCard";
import Loader, { SkeletonReel } from "../../components/ui/Loader";
import BottomNav from "../../components/layout/BottomNav";

export default function Stories() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch feed items based on selected mood filter
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["feed", selectedMood],
    queryFn: () => getFeed(selectedMood || ""),
    refetchOnWindowFocus: false,
  });

  const reels = (data?.data?.feed || data?.data?.trending || []).filter(Boolean);

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col bg-white border-x border-gray-100 shadow-xl relative pb-16">
      {/* Header story selector bar */}
      <div className="bg-white z-40">
        <div className="px-4 pt-3 flex justify-between items-center bg-white">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Food Stories</h1>
          <span className="text-xxs font-bold bg-brand-light text-brand px-2.5 py-1 rounded-full capitalize">
            {selectedMood ? selectedMood.replace("_", " ") : "All Moods"}
          </span>
        </div>
        <StoryBar activeMood={selectedMood} onSelectMood={setSelectedMood} />
      </div>

      {/* Feed container */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {isLoading ? (
          <SkeletonReel />
        ) : reels.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white">
            <p className="text-gray-500 font-bold text-lg">No stories matching this mood.</p>
            <p className="text-gray-400 text-xs mt-1">Try selecting another mood bubble above.</p>
          </div>
        ) : (
          <div
            className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
            style={{
              scrollSnapType: "y mandatory",
              WebkitOverflowScrolling: "touch",
            }}
            onScroll={(e) => {
              const idx = Math.round(e.currentTarget.scrollTop / window.innerHeight);
              if (idx !== activeIndex) {
                setActiveIndex(idx);
              }
            }}
          >
            {reels.map((reel, i) => (
              <ReelCard
                key={reel._id}
                reel={reel}
                isActive={i === activeIndex}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
