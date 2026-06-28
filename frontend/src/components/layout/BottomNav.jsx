import { Home, Bookmark, ShoppingBag, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/",        icon: Home,        label: "Feed" },
  { to: "/stories", icon: BookOpen,    label: "Stories" },
  { to: "/saved",   icon: Bookmark,    label: "Saved" },
  { to: "/orders",  icon: ShoppingBag, label: "Orders" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 z-50 shadow-lg pb-safe">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-all duration-200
             ${isActive ? "text-brand scale-110" : "text-gray-400 hover:text-gray-600"}`
          }
        >
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
