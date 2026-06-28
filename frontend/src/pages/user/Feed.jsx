import ReelFeed from "../../components/feed/ReelFeed";
import StoryBar from "../../components/stories/StoryBar";
import BottomNav from "../../components/layout/BottomNav";
import { LogOut } from "lucide-react";
import { logoutUser } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Feed() {
  const { clearAuth, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearAuth();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col bg-white overflow-hidden pb-16 border-x border-gray-100 shadow-xl relative">
      {/* Top sticky header */}
      <header className="flex justify-between items-center px-4 pt-4 pb-2 bg-white z-40">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-brand tracking-tighter">FOODIE</span>
          <span className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">
            Welcome, {user?.fullName?.split(" ")[0]}!
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-gray-400 hover:text-brand hover:bg-brand-light transition-all"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main horizontal scrolling stories selection */}
      <div className="z-30">
        <StoryBar />
      </div>

      {/* Primary infinite scrolling vertical reel player */}
      <div className="flex-1 relative overflow-hidden bg-black z-10">
        <ReelFeed />
      </div>

      {/* Persistent global mobile navigation */}
      <BottomNav />
    </div>
  );
}
