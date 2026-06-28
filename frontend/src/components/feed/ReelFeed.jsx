import { useState, useEffect } from "react";
import { useFeed } from "../../hooks/useFeed";
import ReelCard from "./ReelCard";
import Loader, { SkeletonReel } from "../ui/Loader";

export default function ReelFeed() {
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useFeed();
  const [activeIndex, setActiveIndex] = useState(0);

  const reels = data?.pages.flatMap((p) => p.data.feed) ?? [];

  // Fetch more reels when scrolling close to the end
  useEffect(() => {
    if (activeIndex >= reels.length - 2 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [activeIndex, hasNextPage, isFetching, reels.length]);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (reels.length === 0) {
    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-500 font-bold text-lg">No reels found in your area.</p>
        <p className="text-gray-400 text-xs mt-1">Check back later or try refreshing.</p>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
      style={{
        scrollSnapType: "y mandatory",
        WebkitOverflowScrolling: "touch", // momentum scrolling on iOS
      }}
      onScroll={(e) => {
        const scrollTop = e.currentTarget.scrollTop;
        const viewportHeight = window.innerHeight;
        const idx = Math.round(scrollTop / viewportHeight);
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
      {isFetching && <SkeletonReel />}
    </div>
  );
}
