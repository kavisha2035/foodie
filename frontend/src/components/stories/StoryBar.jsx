import { useQuery } from "@tanstack/react-query";
import { getStories } from "../../api/feed.api";

const moodEmoji = {
  breakfast: "🌅",
  quick_bite: "⚡",
  comfort_food: "🤗",
  dinner: "🍽️",
  late_night: "🌙",
};

export default function StoryBar({ onSelectMood, activeMood }) {
  const { data, isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: getStories,
    refetchOnWindowFocus: false,
  });

  const stories = data?.data?.stories ?? [];

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto px-4 py-3 bg-white no-scrollbar border-b border-gray-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gray-100" />
            <div className="w-10 h-3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto px-4 py-3 bg-white no-scrollbar border-b border-gray-100">
      {stories.map((story) => {
        const isActive = activeMood === story.mood;
        return (
          <button
            key={story.mood}
            onClick={() => onSelectMood?.(isActive ? null : story.mood)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 focus:outline-none transition active:scale-95"
          >
            <div
              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-gray-50 text-2xl transition-all duration-200
                ${isActive ? "border-brand ring-2 ring-brand/10 scale-105" : "border-gray-200"}`}
            >
              {moodEmoji[story.mood] ?? "🍴"}
            </div>
            <span
              className={`text-[10px] font-semibold capitalize max-w-[68px] truncate transition-colors duration-200
                ${isActive ? "text-brand font-bold" : "text-gray-500"}`}
            >
              {story.mood.replace("_", " ")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
